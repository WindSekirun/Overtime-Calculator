<template>
  <div class="text-center">
    <div v-if="needMigration">
      <div class="d-flex justify-center align-center mt-3">
        <span>
          0.2.0 버전부터 데이터 형식이 변경되어, 기존 버전 데이터에 대한 마이그레이션이 필요합니다.
        </span>
      </div>
      <div class="d-flex justify-center align-center mt-3">
        <v-btn color="#b48ead" class="me-2" @click="clickMigration()">
          데이터 마이그레이션하기
        </v-btn>
      </div>
    </div>

    <div class="d-flex justify-center align-center mt-6">
      <v-btn icon variant="text" color="white" class="me-5" @click="clickPreviousMonth()">
        <v-icon size="large">mdi-chevron-left</v-icon>
      </v-btn>
      <span class="text-h5">{{ displayYearMonth }}월</span>
      <v-btn icon variant="text" color="white" class="ms-5" @click="clickNextMonth()">
        <v-icon size="large">mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <div class="d-flex justify-center align-center mt-3">
      <span class="text-h6 me-2">(세전)</span>
      <span class="text-h3 font-weight-bold">{{ withCommas(Math.floor(tweened.number)) }}</span>
      <span class="text-h4">원</span>
    </div>

    <div class="d-flex justify-center align-center mt-6 pa-2">
      <p style="white-space: pre-line" :class="descriptionClass" v-html="calculated.build()"></p>
    </div>

    <v-row class="d-flex justify-center align-center mt-3">
      <v-col cols="12" md="6">
        <span class="body">이번달 총 계획 시간</span>
        <TimeInput
          :model-value="nowWorkingTime"
          label="근로"
          @update:model-value="inputNowWorkingTime"
        />
      </v-col>
      <v-col cols="12" md="6">
        <span class="body">야간근로</span>
        <TimeInput
          :model-value="overNightTime"
          label="야간"
          @update:model-value="inputOverNightTime"
        />
      </v-col>
    </v-row>
    <v-row class="d-flex justify-center align-center mt-6">
      <v-col cols="12" md="6">
        <span class="body">휴일근로</span>
        <TimeInput
          :model-value="workOffTime"
          label="휴일"
          @update:model-value="inputWorkOffTime"
        />
      </v-col>
      <v-col cols="12" md="6">
        <span class="body">휴가시간</span>
        <TimeInput
          :model-value="vacationTime"
          label="휴가"
          :shortcuts="vacationShortcuts"
          @update:model-value="inputVacationTime"
        />
      </v-col>
    </v-row>

    <div class="d-flex justify-center align-center mt-12">
      <ul class="text-start">
        <li>
          <span class="text-h6 me-2">시급 {{ hourWageText }}원</span>
        </li>
        <li>
          <span class="text-h6 me-2"
            >기준근로 {{ formatMinutes(workingGuideTime) }} {{ diffEmoji }}</span
          >
        </li>
        <li>
          <span class="text-h6 me-2">법내연장 {{ formatMinutes(underLawTime) }}</span>
        </li>
        <li>
          <span class="text-h6 me-2">주 52시간 최대 {{ formatMinutes(maxTime) }}</span>
        </li>
        <li>
          <span class="text-h6 me-2">₩{{ perMinutes }}/분</span>
        </li>
      </ul>
    </div>

    <div class="d-flex justify-center align-center mt-6">
      <a
        href="https://github.com/WindSekirun/Overtime-Calculator/releases"
        class="me-5"
        target="_blank"
      >
        <img
          alt="GitHub release (latest by date)"
          src="https://img.shields.io/github/v/release/windsekirun/Overtime-Calculator?style=for-the-badge"
        />
      </a>
      <a href="https://github.com/WindSekirun/Overtime-Calculator" target="_blank">
        <img
          alt="GitHub"
          src="https://img.shields.io/github/license/WindSekirun/Overtime-Calculator?style=for-the-badge"
        />
      </a>
    </div>

    <div class="d-flex justify-center align-center mt-6 mb-12">
      <v-btn
        class="me-2"
        color="#a3be8c"
        @click="showSetting = !showSetting"
        style="color: #2e3440"
      >
        통상임금 설정
      </v-btn>

      <v-dialog v-model="freqDialog" width="500">
        <template v-slot:activator="{ props }">
          <v-btn color="#b48ead" v-bind="props" class="me-2" style="color: #2e3440"> FAQ </v-btn>
        </template>
        <v-card color="#3b4252">
          <v-card-title class="text-h5" style="background-color: #434c5e; color: #eceff4">
            자주 묻는 질문
          </v-card-title>
          <v-card-text class="mt-5" style="color: #eceff4">
            <div v-for="(item, index) in freqQuestions" :key="index" class="mt-2">
              #{{ index + 1 }}. {{ item.question }}
              <br />
              A. {{ item.answer }}
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#d8dee9" variant="text" @click="freqDialog = false"> 닫기 </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="howDialog" width="500">
        <template v-slot:activator="{ props }">
          <v-btn color="#d08770" v-bind="props" style="color: #2e3440"> 사용법 </v-btn>
        </template>
        <v-card color="#3b4252">
          <v-card-title class="text-h5" style="background-color: #434c5e; color: #eceff4">
            사용 방법
          </v-card-title>
          <v-card-text class="mt-5" style="color: #eceff4">
            과거, 현재, 미래 달에 대한 근무 데이터를 입력하여 초과 근무 시간을 조절할 수
            있습니다.<br />
            <br />
            '이번달 총 계획시간' 은 플래너에 기재된 시간으로, '야간근로', '휴가시간', '휴일시간'
            모두를 포함합니다.<br />
            <br />
            모든 입력은 시간/분 단위로 입력할 수 있으며, 내부적으로 1분 단위로 계산됩니다.<br />
            <br />
            각 카테고리에 맞는 근무시간을 입력하면, 일정 수식에 따라 계산한 결과가 나옵니다. 계산한
            데이터는 세금 공제 전 기준으로, 실제 금액과는 다소 차이가 발생할 수 있습니다.<br />
            <br />
            참고용으로만 사용해주세요.
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#d8dee9" variant="text" @click="howDialog = false"> 닫기 </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-if="showSetting" class="mt-6">
      <v-sheet rounded class="pa-5">
        세전 통상임금 (기본급 + 식대) 설정
        <v-text-field
          class="inputNumber"
          label="기본급"
          v-model="basicPay"
          hide-details
          variant="outlined"
          type="number"
          @update:model-value="inputBasicPay"
          placeholder="금액 입력"
          suffix="원"
        />

        <v-row class="mt-5">
          <v-col cols="6">
            <v-btn color="#bf616a" @click="clickLoadPreviousPay()" block style="color: #eceff4">
              이전달 데이터 가져오기
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn color="#bf616a" @click="clickDemoMode()" block style="color: #eceff4">
              데모모드 설정
            </v-btn>
          </v-col>
        </v-row>
        <v-row class="mt-1">
          <v-col cols="6">
            <v-btn color="#ebcb8b" @click="clickDataCopy()" block style="color: #2e3440">
              데이터 복사
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn color="#ebcb8b" @click="clickDataRestore()" block style="color: #2e3440">
              데이터 복구
            </v-btn>
          </v-col>
        </v-row>
      </v-sheet>
    </div>

    <div class="text-center">
      <v-snackbar v-model="snackbar" :timeout="3000" location="top" color="purple">
        {{ snackbarText }}
      </v-snackbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, reactive } from "vue";
import gsap from "gsap";
import { useStore } from "@/store/store";
import { frequencyQuestions } from "@/model/question";
import { CalculatedResult, DescriptionBuilder } from "@/model/result";
import { formatYearMonth, getUnderLawTime, getYear } from "@/util/date";
import { YearMonth } from "@/model/month";
import { roundNumber } from "@/util/number";
import { useDisplay } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import TimeInput from "@/components/TimeInput.vue";
import { storeToRefs } from "pinia";

const store = useStore();
const route = useRoute();
const router = useRouter();
const display = useDisplay();

// State
const showSetting = ref(false);
const basicPay = ref("");
const nowWorkingTime = ref(0); // Minutes
const vacationTime = ref(0); // Minutes
const overNightTime = ref(0); // Minutes
const workOffTime = ref(0); // Minutes

const freqDialog = ref(false);
const howDialog = ref(false);
const hourWage = ref(0);
const snackbar = ref(false);
const snackbarText = ref("");

// Counter for continuous wage display increment
const displayedWage = ref(0);
const baseCalculatedWage = ref(0); // Base wage without time-based increment
const counterSeconds = ref(0);
let counterInterval: number | null = null;

// Tweening
const tweened = reactive({ number: 0 });

// Store refs
const { needMigration, workingGuideTime, underLawTime } = storeToRefs(store);

const freqQuestions = frequencyQuestions;

const vacationShortcuts = [
  { label: "+2시간", value: 120 },
  { label: "+4시간", value: 240 },
  { label: "+8시간", value: 480 },
];

// Computed
const hourWageText = computed(() => withCommas(hourWage.value));

const maxTime = computed(() => Math.round(getUnderLawTime(store.year, store.month, 52) * 60));

const descriptionClass = computed(() => {
  if (display.xs.value || display.sm.value) return "text-caption";
  return "body-1";
});

const diffEmoji = computed(() => {
  const guide = store.workingGuideTime;
  const law = store.underLawTime;
  // diff in hours
  const diffHours = (law - guide) / 60;
  if (guide > law) {
    return "🔥🔥";
  } else if (diffHours < 3.0) {
    return "🔥";
  }
  return "";
});

const perMinutes = computed(() => {
  return roundNumber(hourWage.value / 60);
});

const displayYearMonth = computed(() => {
  return `${store.year}. ${store.month.toString().padStart(2, "0")}`;
});

const calculated = computed(() => {
  const nowTime = nowWorkingTime.value;
  const vacTime = vacationTime.value;
  const oNightTime = overNightTime.value;
  const wOffTime = workOffTime.value;

  const mTime = maxTime.value;

  // Calculations in minutes
  let resultMinutes = 0;
  const builder: DescriptionBuilder[] = [];
  let errorText = "";

  const workingTime = nowTime;
  if (workingTime >= mTime) {
    resultMinutes = 0;
    errorText = "⬤ 52시간 제도에 따른 최대 시간을 초과하여 계산 불가";
  } else if (workingTime + vacTime < store.workingGuideTime) {
    resultMinutes = 0;
    errorText = "⬤ 기준근로시간을 넘지 않아서 계산 불가";
  } else {
    const baseWorkTime = workingTime - oNightTime - wOffTime - vacTime;
    const baseDescription = new DescriptionBuilder("기본 근로시간", baseWorkTime, 0);
    baseDescription.base = true;
    builder.push(baseDescription);

    if (baseWorkTime > store.underLawTime) {
      // Exceeded Law Time (usually > 40h/week equivalent)
      const x15 = baseWorkTime - store.underLawTime;
      const x1 = store.underLawTime - store.workingGuideTime;

      resultMinutes += x15 * 1.5 + x1;
      builder.push(new DescriptionBuilder("법내연장근로 초과", x15, 1.5));
      builder.push(new DescriptionBuilder("법내연장 - 기준근로", x1, 1));
    } else if (baseWorkTime > store.workingGuideTime) {
      const x1 = baseWorkTime - store.workingGuideTime;
      resultMinutes += x1;
      builder.push(new DescriptionBuilder("기준근로 초과", x1, 1));
    } else if (baseWorkTime < store.workingGuideTime) {
      const x1 = baseWorkTime - store.workingGuideTime; // negative
      resultMinutes += x1;
      const content = new DescriptionBuilder("기준근로 부족", x1, 1);
      content.error = true;
      builder.push(content);
    }

    if (oNightTime != 0) {
      resultMinutes += oNightTime * 1.5;
      builder.push(new DescriptionBuilder("야간근로", oNightTime, 1.5));
    }

    if (wOffTime != 0) {
      // Holiday work: First 8 hours * 1.5, excess * 2.0
      // 8 hours = 480 minutes
      if (wOffTime >= 480) {
        const x2time = wOffTime - 480;
        const x15time = 480;

        resultMinutes += x2time * 2;
        resultMinutes += x15time * 1.5;
        builder.push(new DescriptionBuilder("휴일근로초과", x2time, 2));
        builder.push(new DescriptionBuilder("휴일근로", x15time, 1.5));
      } else {
        resultMinutes += wOffTime * 1.5;
        builder.push(new DescriptionBuilder("휴일근로", wOffTime, 1.5));
      }
    }

    if (vacTime != 0) {
      resultMinutes += vacTime;
      builder.push(new DescriptionBuilder("휴가시간", vacTime, 1));
    }
  }

  const wage = (resultMinutes / 60) * hourWage.value;
  return new CalculatedResult(
    withCommas(wage),
    wage, // Start amount same for now (removed counter)
    wage,
    builder,
    hourWage.value,
    errorText
  );
});

// Watch base calculated wage to reset counter
watch(
  () => calculated.value.amount,
  (newWage) => {
    baseCalculatedWage.value = newWage;
    counterSeconds.value = 0;
    displayedWage.value = newWage; // Immediately update displayed wage to new base
  },
  { immediate: true }
);

// Animate displayed wage
watch(displayedWage, (n) => {
  gsap.to(tweened, { duration: 0.5, number: Number(n) || 0 });
});

// Methods
function withCommas(x: number) {
  return Math.ceil(x)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}시간 ${m}분`;
}

function loadPage(y: number, m: number) {
  store.load(y, m);

  basicPay.value = store.basicPay.toString();
  nowWorkingTime.value = store.nowWorkingTime;
  vacationTime.value = store.vacationTime;
  overNightTime.value = store.overNightTime;
  workOffTime.value = store.workOffTime;

  hourWage.value = Number(basicPay.value) / 209.0;
}

function inputBasicPay(val: string) {
  basicPay.value = val;
  store.saveBasicPay(Number(val));
  hourWage.value = Number(val) / 209.0;
}

// These are receiving minutes directly from TimeInput
function inputNowWorkingTime(val: number) {
  nowWorkingTime.value = val;
  store.saveNowWorkingTime(val);
}

function inputVacationTime(val: number) {
  vacationTime.value = val;
  store.saveVacationTime(val);
}

function inputOverNightTime(val: number) {
  overNightTime.value = val;
  store.saveOverNightTime(val);
}

function inputWorkOffTime(val: number) {
  workOffTime.value = val;
  store.saveWorkOffTime(val);
}

function clickDemoMode() {
  basicPay.value = "2156880";
  inputBasicPay("2156880");
}

function clickLoadPreviousPay() {
  const pay = store.loadPreviousBasicPay();
  basicPay.value = pay.toString();
  inputBasicPay(pay.toString());
}

function clickPreviousMonth() {
  let y = store.year;
  let m = store.month;
  if (m == 1) {
    y = y - 1;
    m = 12;
  } else {
    m = m - 1;
  }
  router.push(`/${formatYearMonth(y, m)}`);
  loadPage(y, m);
}

function clickNextMonth() {
  let y = store.year;
  let m = store.month;
  if (m == 12) {
    y = y + 1;
    m = 1;
  } else {
    m = m + 1;
  }
  router.push(`/${formatYearMonth(y, m)}`);
  loadPage(y, m);
}

async function clickMigration() {
  await store.doMigration();
  // Reload page data after migration
  loadPage(store.year, store.month);
  snackbarText.value = "마이그레이션 완료";
  snackbar.value = true;
}

async function clickDataCopy() {
  const list = store.getDataFromStorage();
  const json = JSON.stringify(list);
  await window.navigator.clipboard.writeText(json);
  snackbarText.value = "데이터가 복사되었습니다.";
  snackbar.value = true;
}

async function clickDataRestore() {
  try {
    const response = await window.navigator.clipboard.readText();
    const list: YearMonth[] = JSON.parse(response);
    store.restoreData(list);
    snackbarText.value = "데이터 복구에 성공했습니다. 새로고침 후 적용됩니다.";
    snackbar.value = true;
    loadPage(store.year, store.month); // Reload
  } catch {
    snackbarText.value = "데이터 복구에 실패했습니다.";
    snackbar.value = true;
  }
}

// Lifecycle
onMounted(async () => {
  const param = route.params.date;
  let m, y;
  if (param) {
    y = Number(param.toString().slice(0, 4));
    m = Number(param.toString().slice(4, 6)); // Fix slice: 0-4 is year, 4-6 is month (e.g. 202212)
  } else {
    y = getYear();
    m = new Date().getMonth() + 1;
  }

  loadPage(y, m);

  // Start continuous counter
  counterInterval = setInterval(() => {
    counterSeconds.value++;
    displayedWage.value = baseCalculatedWage.value + counterSeconds.value * (perMinutes.value / 60);
  }, 1000);
});

onUnmounted(() => {
  if (counterInterval) {
    clearInterval(counterInterval);
    counterInterval = null;
  }
});
</script>

<style scoped>
li,
span {
  color: #eceff4;
}
p {
  color: #d8dee9;
}
</style>
