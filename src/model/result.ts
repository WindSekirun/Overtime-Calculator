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
            let description: string[] = [];
            this.builder.forEach(element => description.push(element.build(this.hourWage)));
            description.push(`⬤ 최종 계산금액: <b>${this.origin}</b>원`)
            return description.join("\n");
        }
    }
}

export class DescriptionBuilder {
    title: string;
    time: number;
    multiply: number;
    error: boolean;

    constructor(title: string, time: number, multiply: number) {
        this.time = time;
        this.multiply = multiply;
        this.title = title;
        this.error = false;
    }

    build(hourWage: number) {
        const time = Math.round(this.time * 10) / 10
        const calculated = Math.ceil(hourWage * (time * this.multiply))
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")

        return `⬤ ${this.wrap(this.title)} ${this.wrap("➜")} ${this.wrap(time + " 시간")} (${this.multiply}배 가산, ${calculated}원)`;
    }

    private wrap(text: string | number) {
        if (this.error) {
            return `<font color="#F08080"><b>${text}</b></font>`
        } else {
            return `<b>${text}</b>`
        }
    }
}