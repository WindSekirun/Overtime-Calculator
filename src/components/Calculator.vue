<template>
  <div align-center>
    <div v-if="needMigration">
      <div class="d-flex justify-center align-center mt-3">
        <span>0.2.0 버전부터 데이터 형식이 변경되어, 기존 버전 데이터에 대한
          마이그레이션이 필요합니다.
        </span>
      </div>

      <div class="d-flex justify-center align-center mt-3">
        <v-btn color="#b48ead" class="me-2" @click="clickMigration()">
          데이터 마이그레이션하기
        </v-btn>
      </div>
    </div>

    <div class="d-flex justify-center align-center mt-6">
      <v-btn icon color="white" class="me-5" @click="clickPreviousMonth()">
        <v-icon large>mdi-chevron-left</v-icon>
      </v-btn>
      <span class="text-h5">{{ displayYearMonth }}월</span>
      <v-btn icon color="white" class="ms-5" @click="clickNextMonth()">
        <v-icon large>mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <div class="d-flex justify-center align-center mt-3">
      <span class="text-h6 me-2">(세전)</span>
      <countTo
        class="text-h3 font-weight-bold"
        :startVal="calculated.startAmount"
        :endVal="calculated.amount"
        :duration="800"
      />
      <span class="text-h4">원</span>
    </div>

    <div class="d-flex justify-center align-center mt-6">
      <p
        style="white-space: pre-line"
        :class="descriptionClass"
        v-html="calculated.build()"
      ></p>
    </div>

    <v-row class="d-flex justify-center align-center mt-6">
      <v-col sm="4" lg="2">
        <span class="text-h6">기본+연장</span>
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
        <span class="text-h6">야간근로</span>
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
        <span class="text-h6">휴가시간</span>
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
        <li>
          <span class="text-h6 me-2">Per Second {{ perSecond }}</span>
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
      <v-btn class="me-2" color="#a3be8c" @click="showSetting = !showSetting">
        통상임금 설정
      </v-btn>
      <v-dialog v-model="freqDialog" width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="#b48ead" v-bind="attrs" v-on="on" class="me-2">
            FAQ
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

      <v-dialog v-model="howDialog" width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="#d08770" v-bind="attrs" v-on="on"> 사용법 </v-btn>
        </template>

        <v-card color="#3b4252">
          <v-card-title
            class="text-h5"
            style="background-color: #434c5e; color: #eceff4"
          >
            사용 방법
          </v-card-title>

          <v-card-text class="mt-5" style="color: #eceff4">
            과거, 현재, 미래 달에 대한 근무 데이터를 입력하여 초과 근무 시간을
            조절할 수 있습니다.<br />
            <br />
            '기본+연장' 은 기준근로시간 + 연장시간을 합한 값이며, '연장시간'
            에는 아래와 같은 값이 포함됩니다.<br />
            ⬤ 평일 06시 ~ 22시 이내에서, 휴게시간과 8시간을 제외한 시간의 합<br />
            ⬤ 토요일 근무 시간의 합<br />
            만일, 평일 06~22시 사이에서 2시간씩 10영업일을 초과한 경우, 20시간이
            됩니다.<br />
            <br />
            '야간근로' 는 평일 06시 ~ 22시 이외에서 근무한 시간의 합입니다.<br />
            <br />
            '휴가시간' 은 근무를 하지 않은 시간의 합입니다. (2시간 휴가를 4번
            사용한 경우 8시간)<br />
            <br />
            각 카테고리에 맞는 근무시간을 입력하면, 일정 수식에 따라 계산한
            결과와, 중간 계산 결과가 나옵니다. 계산한 데이터는 세금 공제 전
            기준으로, 실제 금액과는 다소 차이가 발생할 수 있습니다.<br />
            <br />
            참고용으로만 사용해주세요.
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#d8dee9" text @click="howDialog = false">
              닫기
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-if="showSetting" class="mt-6">
      <v-sheet light rounded class="pa-5">
        세전 통상임금 (기본급 + 식대) 설정
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
        <v-btn
          class="mt-5"
          color="#bf616a"
          @click="clickLoadPreviousPay()"
          block
          style="color: #eceff4"
        >
          이전달 데이터 가져오기
        </v-btn>
        <v-btn
          class="mt-5"
          color="#bf616a"
          @click="clickDemoMode()"
          block
          style="color: #eceff4"
        >
          데모모드 설정
        </v-btn>
      </v-sheet>
    </div>

    <div class="text-center">
      <v-snackbar v-model="snackbar" :timeout="3000" top color="purple">
        {{ snackbarText }}
      </v-snackbar>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { useStore } from "@/store/store";
import { frequencyQuestions } from "@/model/question";
import { CalculatedResult, DescriptionBuilder } from "@/model/result";
//@ts-ignore
import countTo from "vue-count-to";
import { formatYearMonth, getUnderLawTime, getYear, roundNumber } from "@/util/date";

@Component({
  components: { countTo },
})
export default class Calculator extends Vue {
  showSetting = false;
  basicPay = "";
  nowWorkingTime = "";
  vacationTime = "";
  overNightTime = "";
  freqDialog = false;
  howDialog = false;
  hourWage = 0;
  needMigration = false;
  snackbar = false;
  snackbarText = "";

  counterStart = 0;
  counterEnd = 0;
  counterInterval: number | null = null;

  increaseCounter() {
    if (!(this.counterStart == 0 && this.counterEnd == 0)) {
      this.counterStart += 1;
    }
    this.counterEnd += 1;
  }

  mounted() {
    const param = this.$route.params.date;
    let month;
    let year;
    if (param) {
      year = Number(param.toString().slice(0, 4));
      month = Number(param.toString().slice(5, 6));
    } else {
      year = getYear();
      month = new Date().getMonth() + 1;
    }

    this.loadPage(year, month);
    this.counterInterval = setInterval(this.increaseCounter, 1000);
  }

  beforeUnmount() {
    if (this.counterInterval) {
      clearInterval(this.counterInterval);
      this.counterInterval = null;
    }
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
    return getUnderLawTime(useStore().year, useStore().month, 52);
  }

  get descriptionClass() {
    switch (this.$vuetify.breakpoint.name) {
      case "xs":
        return "text-caption";
      case "sm":
        return "text-caption";
      case "md":
        return "body-1";
      case "lg":
        return "body-1";
      case "xl":
        return "body-1";
    }
  }

  get perSecond() {
    // {{ counterEnd / 60 }}m {{ counterEnd % 60 }}s ({{ roundNumber(hourWage / 3600) }}
    return `${Math.floor(this.counterEnd / 60)}|${Math.floor(
      this.counterEnd % 60
    )}|${roundNumber(this.hourWage / 3600)}`;
  }

  get displayYearMonth() {
    const year = useStore().year;
    const month = useStore().month;

    return `${year}. ${month.toString().padStart(2, "0")}`;
  }

  get calculated() {
    const store = useStore();
    const nowTime = Number(this.nowWorkingTime);
    const vacationTime = Number(this.vacationTime);
    const overNightTime = Number(this.overNightTime);
    const maxTime = this.maxTime;
    const perSecond = this.hourWage / 3600;

    let result = 0;
    let builder: DescriptionBuilder[] = [];
    let errorText: string = "";

    const workingTime = nowTime + overNightTime;
    if (workingTime >= maxTime) {
      result = 0;
      errorText = "⬤ 52시간 제도에 따른 최대 시간을 초과하여 계산 불가";
    } else if (workingTime + vacationTime < this.workingGuideTime) {
      result = 0;
      errorText = "⬤ 기준근로시간을 넘지 않아서 계산 불가";
    } else {
      if (nowTime > store.underLawTime) {
        // 법내연장근로를 초과한 경우
        const x15 = roundNumber(nowTime - store.underLawTime);
        const x1 = roundNumber(
          store.underLawTime - store.workingGuideTime
        );
        result += x15 * 1.5 + x1;

        builder.push(new DescriptionBuilder("법내연장근로 초과", x15, 1.5));
        builder.push(new DescriptionBuilder("법내연장 - 기준근로", x1, 1));
      } else if (nowTime > store.workingGuideTime) {
        // 기준근로시간을 초과한 경우
        const x1 = roundNumber(nowTime - store.workingGuideTime);
        result += x1;
        builder.push(new DescriptionBuilder("기준근로 초과", x1, 1));
      } else {
        const x1 = roundNumber(nowTime - store.workingGuideTime);
        result += x1;
        const content = new DescriptionBuilder("기준근로 부족 ", x1, 1);
        content.error = true;
        builder.push(content);
      }

      if (overNightTime != 0) {
        result += overNightTime * 1.5;
        builder.push(new DescriptionBuilder("야간근로", overNightTime, 1.5));
      }

      if (vacationTime != 0) {
        result += vacationTime;
        builder.push(new DescriptionBuilder("휴가시간", vacationTime, 1));
      }
    }
    const wage = result * this.hourWage;
    return new CalculatedResult(
      this.withCommas(wage),
      wage + perSecond * this.counterStart,
      wage + perSecond * this.counterEnd,
      builder,
      this.hourWage,
      errorText
    );
  }

  multiplyDesc(ratio: number, time: number) {
    const calculated = this.withCommas(this.hourWage * time);
    return `만큼 <b>${ratio}배</b> 가산 <b>(${calculated}원)</b>`;
  }

  loadPage(year: number, month: number) {
    const store = useStore();
    store.load(year, month);

    this.basicPay = store.basicPay.toString();
    this.nowWorkingTime = store.nowWorkingTime.toString();
    this.vacationTime = store.vacationTime.toString();
    this.overNightTime = store.overNightTime.toString();
    this.hourWage = Number(this.basicPay) / 209.0;
    this.needMigration = store.needMigration;
  }

  withCommas(x: number) {
    return Math.ceil(x)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  inputBasicPay() {
    useStore().saveBasicPay(Number(this.basicPay));
    this.hourWage = Number(this.basicPay) / 209.0;
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

  clickDemoMode() {
    this.basicPay = "1000000";
    this.hourWage = 1000000 / 209.0;
  }

  clickLoadPreviousPay() {
    const pay = useStore().loadPreviousBasicPay();
    this.basicPay = pay.toString();
    this.hourWage = pay / 209.0;
    useStore().saveBasicPay(pay);
  }

  clickPreviousMonth() {
    let year = useStore().year;
    let month = useStore().month;
    if (month == 1) {
      year = year - 1;
      month = 12;
    } else {
      month = month - 1;
    }

    this.$router.push(`/${formatYearMonth(year, month)}`);
    this.loadPage(year, month);
  }

  clickNextMonth() {
    let year = useStore().year;
    let month = useStore().month;
    if (month == 12) {
      year = year + 1;
      month = 1;
    } else {
      month = month + 1;
    }

    this.$router.push(`/${formatYearMonth(year, month)}`);
    this.loadPage(year, month);
  }

  async clickMigration() {
    await useStore().doMigration();
    this.needMigration = false;
    this.snackbarText = "마이그레이션 완료";
    this.snackbar = true;
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
