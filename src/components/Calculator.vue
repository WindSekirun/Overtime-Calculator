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
      <span class="text-h3 font-weight-bold">{{ calculated }}</span>
      <span class="text-h4">원</span>
    </div>

    <div class="d-flex justify-center align-center mt-6">
      <p
        style="white-space: pre-line"
        class="text-caption"
        v-html="description"
      ></p>
    </div>

    <v-row class="d-flex justify-center align-center mt-6">
      <v-col sm="6" lg="2">
        <span class="text-h6">총 근로시간</span>
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
      <v-col sm="6" lg="2">
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
          <span class="text-h6 me-2"
            >시급 {{ hourWage }}원</span
          >
        </li>
        <li>
          <span class="text-h6 me-2">기준근로 {{ workingGuideTime }}시간</span>
        </li>
        <li>
          <span class="text-h6 me-2">법내연장 {{ underLawTime }}시간</span>
        </li>
      </ul>
    </div>

    <div class="d-flex justify-center align-center mt-6">
      <a href="https://github.com/WindSekirun/Overtime-Calculator/releases" class="me-2">
        <img
          alt="GitHub release (latest by date)"
          src="https://img.shields.io/github/v/release/windsekirun/Overtime-Calculator?style=for-the-badge"
        />
      </a>
      <a href="https://github.com/WindSekirun/Overtime-Calculator" class="me-2">
        <img
          alt="GitHub"
          src="https://img.shields.io/github/license/WindSekirun/Overtime-Calculator?style=for-the-badge"
        />
      </a>
    </div>

    <div class="d-flex justify-center align-center mt-6">
      <v-btn color="#a3be8c" @click="showSetting = !showSetting">
        데이터 설정하기
      </v-btn>
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

@Component({
  components: {},
})
export default class Calculator extends Vue {
  showSetting = false;
  basicPay = "";
  nowWorkingTime = "";
  vacationTime = "";

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

  get month() {
    return useStore().month;
  }

  get workingGuideTime() {
    return useStore().workingGuideTime;
  }

  get underLawTime() {
    return useStore().underLawTime;
  }

  get hourWage() {
    return this.withCommas(Number(this.basicPay) / 209.0);
  }

  get calculated() {
    const store = useStore();
    const basicPay = Number(this.basicPay);
    const nowTime = Number(this.nowWorkingTime);
    const vacationTime = Number(this.vacationTime);
    const hourWageLower = basicPay / 209.0; // 기본급 / 209시간을 시급으로 계산

    let result = 0;
    if (nowTime > store.underLawTime) {
      // 법내연장근로를 초과한 경우
      const x15 = this.roundNumber(nowTime - store.underLawTime) * 1.5;
      const x1 = this.roundNumber(store.underLawTime - store.workingGuideTime);
      result += x15 + x1 + vacationTime;
    } else if (nowTime >= store.workingGuideTime) {
      // 기준근로시간을 초과한 경우
      const x1 = this.roundNumber(nowTime - store.workingGuideTime);
      result += x1 + vacationTime;
    } else {
      result = 0;
    }

    const wage = result * hourWageLower;
    return `${this.withCommas(wage)}`;
  }

  get description() {
    const store = useStore();
    const basicPay = Number(this.basicPay);
    const nowTime = Number(this.nowWorkingTime);
    const vacationTime = Number(this.vacationTime);

    let content: string[] = [];

    content.push("⬤ 모든 계산은 세전 기준");

    if (nowTime > store.underLawTime) {
      const underLaw = this.roundNumber(nowTime - store.underLawTime);
      const diff = this.roundNumber(
        store.underLawTime - store.workingGuideTime
      );
      content.push(
        `⬤ 법내연장근로 초과분 <b>'${underLaw}시간'</b> 만큼 <b>1.5배</b> 가산`
      );
      content.push(
        `⬤ '법내연장 - 기준근로시간'인 <b>'${diff}시간'</b> 만큼 <b>1배</b> 가산`
      );
      if (vacationTime != 0) {
        content.push(
          `⬤ 휴가 시간 <b>'${vacationTime}시간'</b> 만큼 <b>1배</b> 가산`
        );
      }
    } else if (nowTime >= store.workingGuideTime) {
      const diff = this.roundNumber(nowTime - store.workingGuideTime);
      content.push(
        `⬤ 기준근로 초과한 시간인 <b>'${diff}시간'</b> 만큼 <b>1배</b> 가산`
      );
      if (vacationTime != 0) {
        content.push(
          `⬤ 휴가 시간 <b>'${vacationTime}시간'</b> 만큼 <b>1배</b> 가산`
        );
      }
    } else {
      content.push("⬤ 기준근로시간을 넘지 않아서 계산 불가");
    }

    return content.join("\n");
  }

  loadPage(month: number) {
    const store = useStore();
    store.load(month);

    this.basicPay = store.basicPay.toString();
    this.nowWorkingTime = store.nowWorkingTime.toString();
    this.vacationTime = store.vacationTime.toString();
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
