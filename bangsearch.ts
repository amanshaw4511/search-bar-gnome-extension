import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { BangConfig } from './types.js';

function readFile(path: string) {
    const file = Gio.File.new_for_path(path);
    const [ok, contents] = file.load_contents(null);
    if (!ok) {
        logError(new Error(`Failed to read file: ${path}`), `[ Search Bar ] [Error reading file]`);
        return '';
    }
    return contents.toString();
}


export class Config {
    private static instance: Config = new Config();
    private config: BangConfig[];

    private constructor() {
        log(`[ Search Bar ] Initializing Config`);
        this.config = this.readConfig();
    }

    static getInstance(): Config {
        return this.instance;
    }


    private readConfig(): BangConfig[] {
        try {
            const configFile = `${GLib.get_home_dir()}/.config/search-bar/config.json`

            log(`[ Search Bar ] Reading config file from: ${configFile}`);

            const config = readFile(configFile);

            return JSON.parse(config);
        } catch (e: any) {
            logError(e, `[ Search Bar ] [Error reading config file]`);
            Main.notify(_("Can't read config file"));
            return []
        }
    }


    getConfig(): BangConfig[] {
        return this.config;
    }

    reloadConfig(): BangConfig[] {
        this.config = this.readConfig();
        return this.config;
    }

}




export function handlBangQuery(query: string) {
    const configs = Config.getInstance().getConfig();
    log(`{ query: ${query}, config: ${JSON.stringify(configs)}`);

    const config = configs.find(c => c.bang && query.startsWith(`!${c.bang}`));
    if (!config) {
        log(`[ Search Bar ] [Error] No bang command found for query: ${query}`);
        Main.notify(_("No bang command found for query: ") + `${query}`);
        return;
    }

    const command = config.command;
    const wildcard = config.wildcard ?? '{{query}}';
    const delimiter = config.delimiter ?? ' ';

    const compiledCommand = command.replace(wildcard, query.slice(config.bang.length + 1).trim().replace(/ /g, delimiter));
    log(`[ Search Bar ] Executing bang command: ${compiledCommand}`);
    try {
        GLib.spawn_command_line_async(compiledCommand);
    } catch (e: any) {
        logError(e, `[ Search Bar ] [Error spawning bang command]: ${compiledCommand}`);
        Main.notify(_("Can't execute bang command: ") + `${compiledCommand}`);
        return;
    }
}

