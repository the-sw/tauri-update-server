import express from 'express';
import { compare } from 'compare-versions';
import { github } from '../lib/github.js';
import { getReleases } from '../lib/getReleases.js';
import { template } from '../lib/template.js';
import type { Request, Response } from 'express';

const app = express();

interface Parameters {
    current_version: string;
    target: string;
    arch: string;
}
app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Health check');
});

app.get('/update/:target/:arch/:version', async (req: Request, res: Response) => {
    //     darwin
    // x86_64
    // 0.0.0
    const target = req.params.target;
    const arch = req.params.arch;
    const current_version = req.params.version;
    console.log(`/update/${target}/${arch}/${current_version}`);
    if (current_version && target && arch) {
        const latest = await github();
        // console.log('latest');
        // console.log(latest);
        // console.log('-------------------------');
        // console.log(current_version);
        if (compare(latest.tag_name, current_version, '>')) {
            console.log('new version');
            const version = process.env.TAG_STRUCTURE ? latest.tag_name.split(process.env.TAG_STRUCTURE)[1] : latest.tag_name;
            const release = getReleases(latest.assets, target, arch);

            // console.log(release);
            // console.log(Object.keys(release).length);
            if (Object.keys(release).length !== 0) {
                res.status(200).send(await template(release, version, current_version)); 
            
            } else {
                res.status(204).send();
            }
        } else {
            res.status(204).send();
        }
    } else {
        res.status(400).send({
            message: 'Invalid request',
        });
    }
});
app.listen(3100, () => console.log(`Server started on http://localhost:3100`));
