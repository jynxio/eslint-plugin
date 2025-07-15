import packageJson from '../package.json';
import { underscoreFilePattern } from './underscore-file-pattern';

const plugin = {
    meta: {
        name: packageJson.name,
        version: packageJson.version,
    },
    rules: {
        'underscore-file-pattern': underscoreFilePattern,
    },
};

export default plugin;
