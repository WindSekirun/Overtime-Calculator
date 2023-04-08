export class ReleaseInfo {
    name: string;
    body: string;
    date: string;

    constructor(name: string, body: string, date: string) {
        this.name = name;
        this.body = body;
        this.date = date;
    }
}