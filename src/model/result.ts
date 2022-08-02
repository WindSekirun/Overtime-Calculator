export class CalculatedResult {
    amount: string;
    builder: DescriptionBuilder[];
    hourWage: number;
    errorText: string;

    constructor(amount: string, builder: DescriptionBuilder[], hourWage: number, errorText: string) {
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
            return description.join("\n");
        }
    }
}

export class DescriptionBuilder {
    title: string;
    time: number;
    multiply: number;

    constructor(title: string, time: number, multiply: number) {
        this.time = time;
        this.multiply = multiply;
        this.title = title;
    }

    build(hourWage: number) {
        const time = Math.round(this.time * 10) / 10
        const calculated = Math.ceil(hourWage * (time * this.multiply))
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")

        return `⬤ ${this.wrap(this.title)} ➜ ${this.wrap(time)} 시간 (${this.multiply}배 가산, ${calculated}원)`;
    }

    private wrap(text: string | number) {
        return `<b>${text}</b>`
    }
}