import { roundNumber } from "@/util/number";

export class CalculatedResult {
    origin: string;
    startAmount: number;
    amount: number;
    builder: DescriptionBuilder[];
    hourWage: number;
    errorText: string;

    constructor(origin: string, startAmount: number, amount: number, builder: DescriptionBuilder[], hourWage: number, errorText: string) {
        this.origin = origin;
        this.startAmount = startAmount;
        this.amount = amount;
        this.errorText = errorText;
        this.builder = builder;
        this.hourWage = hourWage;
    }

    build() {
        if (this.errorText) {
            return this.errorText;
        } else {
            const description: string[] = [];
            const multiplyList: number[] = []; // effective minutes
            this.builder.forEach(element => {
                const build = element.build(this.hourWage);
                description.push(build[0])
                multiplyList.push(Number(build[1]))
            });
            const sumMinutes = roundNumber(multiplyList.reduce((prev, current) => prev + current));
            const h = Math.floor(sumMinutes / 60);
            const m = Math.round(sumMinutes % 60);
            description.push(`⬤ 최종 계산금액: <b>${this.origin}</b>원 (${h}h ${m}m)`)
            return description.join("\n");
        }
    }
}

export class DescriptionBuilder {
    title: string;
    time: number; // Minutes
    multiply: number;
    error: boolean;
    base: boolean;

    constructor(title: string, time: number, multiply: number) {
        this.time = time;
        this.multiply = multiply;
        this.title = title;
        this.error = false;
        this.base = false;
    }

    build(hourWage: number) {
        const timeMinutes = this.time;
        const effectiveMinutes = timeMinutes * this.multiply;
        
        const h = Math.floor(timeMinutes / 60);
        const m = Math.round(timeMinutes % 60);
        const timeStr = `${h}h ${m}m`;

        const effH = Math.floor(effectiveMinutes / 60);
        const effM = Math.round(effectiveMinutes % 60);
        const effStr = `${effH}h ${effM}m`;
        
        // Wage calculation: (Effective Minutes / 60) * HourWage
        const calculated = Math.ceil((effectiveMinutes / 60) * hourWage)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        
        if (this.base) {
            return [`⬤ ${this.wrap(this.title)} ${this.wrap("➜")} ${this.wrap(timeStr)}`, String(effectiveMinutes)]
        } else {
            return [`⬤ ${this.wrap(this.title)} ${this.wrap("➜")} ${this.wrap(timeStr)} (${this.multiply}x, ${effStr}➜${calculated}원)`, String(effectiveMinutes)]
        }
    }

    private wrap(text: string | number) {
        if (this.error) {
            return `<font color="#F08080"><b>${text}</b></font>`
        } else {
            return `<b>${text}</b>`
        }
    }
}
