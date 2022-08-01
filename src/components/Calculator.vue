<template>
  <div align-center>
    <div class="d-flex justify-center align-center mt-6">
      <v-btn icon color="white" class="me-5" @click="clickPreviousMonth()">
        <v-icon large>mdi-chevron-left</v-icon>
      </v-btn>
      <span class="text-h5">{{ month }}월</span>
      <v-btn icon color="white" class="ms-5" @click="clickNextMonth()">
        <v-icon large>mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <div class="d-flex justify-center align-center mt-3">
      <span class="text-h3 font-weight-bold">{{ calculated.amount }}</span>
      <span class="text-h4">원</span>
    </div>

    <div class="d-flex justify-center align-center mt-6">
      <p
        style="white-space: pre-line"
        class="body-1"
        v-html="calculated.build()"
      ></p>
    </div>

    <v-row class="d-flex justify-center align-center mt-6">
      <v-col sm="4" lg="2">
        <span class="text-h6">기본근로 + 연장근로</span>
        <v-text-field
          v-model="nowWorkingTime"
          hide-details
          single-line
          class="inputNumber"
          label="근로시간"
          type="number"
          @input="inputNowWorkingTime"
          placeholder="시간 입력"
          dark
          suffix="시간"
        />
      </v-col>
      <v-col sm="4" lg="2">
        <span class="text-h6">야간근로 (10시 이후)</span>
        <v-text-field
          v-model="overNightTime"
          hide-details
          single-line
          class="inputNumber"
          label="야간시간"
          type="number"
          @input="inputOverNightTime"
          placeholder="시간 입력"
          dark
          suffix="시간"
        />
      </v-col>
      <v-col sm="4" lg="2">
        <span class="text-h6">휴가 시간</span>
        <v-text-field
          class="inputNumber"
          v-model="vacationTime"
          hide-details
          single-line
          type="number"
          @input="inputVacationTime"
          label="휴가시간"
          placeholder="시간 입력"
          dark
          suffix="시간"
        />
      </v-col>
    </v-row>
    <div class="d-flex justify-center align-center mt-12">
      <ul>
        <li>
          <span class="text-h6 me-2">시급 {{ hourWageText }}원</span>
        </li>
        <li>
          <span class="text-h6 me-2">기준근로 {{ workingGuideTime }}시간</span>
        </li>
        <li>
          <span class="text-h6 me-2">법내연장 {{ underLawTime }}시간</span>
        </li>
        <li>
          <span class="text-h6 me-2">주 52시간 최대 {{ maxTime }}시간</span>
        </li>
      </ul>
    </div>

    <div class="d-flex justify-center align-center mt-6">
      <a
        href="https://github.com/WindSekirun/Overtime-Calculator/releases"
        class="me-5"
      >
        <img
          alt="GitHub release (latest by date)"
          src="https://img.shields.io/github/v/release/windsekirun/Overtime-Calculator?style=for-the-badge"
        />
      </a>
      <a href="https://github.com/WindSekirun/Overtime-Calculator">
        <img
          alt="GitHub"
          src="https://img.shields.io/github/license/WindSekirun/Overtime-Calculator?style=for-the-badge"
        />
      </a>
    </div>

    <div class="d-flex justify-center align-center mt-6">
      <v-btn class="me-5" color="#a3be8c" @click="showSetting = !showSetting">
        데이터 설정하기
      </v-btn>
      <v-dialog v-model="freqDialog" width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="#b48ead" v-bind="attrs" v-on="on">
            자주 묻는 질문
          </v-btn>
        </template>

        <v-card color="#3b4252">
          <v-card-title
            class="text-h5"
            style="background-color: #434c5e; color: #eceff4"
          >
            자주 묻는 질문
          </v-card-title>

          <v-card-text class="mt-5" style="color: #eceff4">
            <div
              v-for="(item, index) in freqQuestions"
              :key="index"
              class="mt-2"
            >
              #{{ index + 1 }}. {{ item.question }}
              <br />
              A. {{ item.answer }}
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#d8dee9" text @click="freqDialog = false">
              닫기
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-if="showSetting" class="mt-6">
      <v-sheet light rounded class="pa-5">
        기본급 설정
        <v-text-field
          class="inputNumber"
          label="기본급"
          v-model="basicPay"
          hide-details
          single-line
          type="number"
          @input="inputBasicPay"
          placeholder="금액 입력"
          light
          suffix="원"
        />
      </v-sheet>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { useStore } from "@/store/store";
import { frequencyQuestions } from "@/model/question";
import { CalculatedResult, DescriptionBuilder } from "@/model/result";
import lastDayOfMonth from "date-fns/lastDayOfMonth";
import endOfHour from "date-fns/endOfHour/index";

@Component({
  components: {},
})
export default class Calculator extends Vue {
  showSetting = false;
  basicPay = "";
  nowWorkingTime = "";
  vacationTime = "";
  overNightTime = "";
  freqDialog = false;
  hourWage = 0;

  mounted() {
    const param = this.$route.params.date;
    let month;
    if (param) {
      month = Number(param);
    } else {
      month = new Date().getMonth() + 1;
    }

    this.loadPage(month);
  }

  get freqQuestions() {
    return frequencyQuestions;
  }

  get month() {
    return useStore().month;
  }

  get workingGuideTime() {
    return useStore().workingGuideTime;
  }

  get underLawTime() {
    return useStore().underLawTime;
  }

  get hourWageText() {
    return this.withCommas(this.hourWage);
  }

  get maxTime() {
    const lastDay = lastDayOfMonth(this.month).getDate();
    return this.roundNumber((52 * lastDay) / 7);
  }

  get calculated() {
    const store = useStore();
    const nowTime = Number(this.nowWorkingTime);
    const vacationTime = Number(this.vacationTime);
    const hourWage = Number(this.basicPay) / 209.0;
    const overNightTime = Number(this.overNightTime) * 1.5; // 야간수당은 1.5배
    const maxTime = this.maxTime;

    let result = 0;
    let builder: DescriptionBuilder[] = [];
    let errorText: string = "";

    const workingTime = nowTime + overNightTime;
    if (workingTime >= maxTime) {
      result = 0;
      errorText = "⬤ 52시간 제도에 따른 최대 시간을 초과하여 계산 불가";
    } else if (workingTime < this.workingGuideTime) {
      result = 0;
      errorText = "⬤ 기준근로시간을 넘지 않아서 계산 불가";
    } else {
      if (nowTime > store.underLawTime) {
        // 법내연장근로를 초과한 경우
        const x15 = this.roundNumber(nowTime - store.underLawTime) * 1.5;
        const x1 = this.roundNumber(
          store.underLawTime - store.workingGuideTime
        );
        result += x15 + x1;

        builder.push(new DescriptionBuilder("법내연장근로 초과", x15, 1.5))
        builder.push(new DescriptionBuilder("법내연장 - 기준근로", x1, 1))
      } else {
        // 기준근로시간을 초과한 경우
        const x1 = this.roundNumber(nowTime - store.workingGuideTime);
        result += x1;
        builder.push(new DescriptionBuilder("기준근로 초과", x1, 1))
      }

      if (overNightTime != 0) {
        result += overNightTime
        builder.push(new DescriptionBuilder("야간근로", overNightTime, 1.5))
      }

      if (vacationTime != 0) {
        result += vacationTime
        builder.push(new DescriptionBuilder("휴가시간", vacationTime, 1))
      }
    }
    const wage = result * hourWage;
    return new CalculatedResult(this.withCommas(wage), builder, hourWage, errorText);
  }

  multiplyDesc(ratio: number, time: number) {
    const calculated = this.withCommas(this.hourWage * time);
    return `만큼 <b>${ratio}배</b> 가산 <b>(${calculated}원)</b>`;
  }

  loadPage(month: number) {
    const store = useStore();
    store.load(month);

    this.basicPay = store.basicPay.toString();
    this.nowWorkingTime = store.nowWorkingTime.toString();
    this.vacationTime = store.vacationTime.toString();
    this.overNightTime = store.overNightTime.toString();
    this.hourWage = Number(this.basicPay) / 209.0;
  }

  roundNumber(x: number) {
    return Math.round(x * 10) / 10;
  }

  withCommas(x: number) {
    return Math.ceil(x)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  inputBasicPay() {
    useStore().saveBasicPay(Number(this.basicPay));
  }

  inputNowWorkingTime() {
    useStore().saveNowWorkingTime(Number(this.nowWorkingTime));
  }

  inputVacationTime() {
    useStore().saveVacationTime(Number(this.vacationTime));
  }

  inputOverNightTime() {
    useStore().saveOverNightTime(Number(this.overNightTime));
  }

  clickPreviousMonth() {
    const current = useStore().month;
    this.$router.push(`/${current - 1}`);
    this.loadPage(current - 1);
  }

  clickNextMonth() {
    const current = useStore().month;
    this.$router.push(`/${current + 1}`);
    this.loadPage(current + 1);
  }
}
</script>

<style>
li,
span {
  color: #eceff4;
}
p {
  color: #d8dee9;
}
</style>

<style scoped>
.inputNumber >>> input[type="number"] {
  -moz-appearance: textfield;
}
.inputNumber >>> input::-webkit-outer-spin-button,
.inputNumber >>> input::-webkit-inner-spin-button {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}
</style>
