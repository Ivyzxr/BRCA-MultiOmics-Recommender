// ============================================================
// BRCA Multi-Omics Recommender
// Final 4-Step Wizard
//
// Step 1: Select Omics
// Step 2: Select + Evaluate Combination
// Step 3: Select Algorithm
// Step 4: Algorithm Details
// ============================================================

const DATA_PATHS={
   combinations:"data/combination_rank.csv",
   algorithms:"data/combination_algorithm_rank.csv",
   metadata:"data/algorithm_metadata.csv"
};

const OMICS=["CNV","MET","MIR","PRO","RNA","SNP"];

let combinationData=[];
let algorithmData=[];
let metadataData=[];

let filteredCombinations=[];
let selectedCombination=null;
let selectedAlgorithm=null;


// ============================================================
// 1. 初始化
// ============================================================

document.addEventListener("DOMContentLoaded",async()=>{
   bindEvents();

   try {
      await loadAllData();
      updateSelectedOmics();
   } catch(error) {
      console.error(error);

      alert(
         "Failed to load CSV files. Please check the data folder and local server."
      );
   }
});


// ============================================================
// 2. 读取CSV
// ============================================================

function loadCSV(path) {

   return new Promise((resolve,reject)=>{

      Papa.parse(path,{
         download:true,
         header:true,
         dynamicTyping:true,
         skipEmptyLines:true,
         complete:results=>resolve(results.data),
         error:error=>reject(error)
      });

   });
}


async function loadAllData() {

   [combinationData,algorithmData,metadataData]=await Promise.all([
      loadCSV(DATA_PATHS.combinations),
      loadCSV(DATA_PATHS.algorithms),
      loadCSV(DATA_PATHS.metadata)
   ]);

   console.log("Combination rows:",combinationData.length);
   console.log("Combination × Algorithm rows:",algorithmData.length);
   console.log("Metadata rows:",metadataData.length);
}


// ============================================================
// 3. 绑定事件
// ============================================================

function bindEvents() {

   document.getElementById("selectAllBtn").addEventListener("click",()=>{
      document.querySelectorAll(".omics-option input")
         .forEach(x=>x.checked=true);

      updateSelectedOmics();
   });


   document.getElementById("clearAllBtn").addEventListener("click",()=>{
      document.querySelectorAll(".omics-option input")
         .forEach(x=>x.checked=false);

      updateSelectedOmics();
   });


   document.querySelectorAll(".omics-option input")
      .forEach(x=>{
         x.addEventListener("change",updateSelectedOmics);
      });


   document.getElementById("step1Next")
      .addEventListener("click",goFromStep1);

   document.getElementById("step2Back")
      .addEventListener("click",()=>showStep(1));

   document.getElementById("step2Next")
      .addEventListener("click",goFromStep2);

   document.getElementById("step3Back")
      .addEventListener("click",()=>showStep(2));

   document.getElementById("step3Next")
      .addEventListener("click",goFromStep3);

   document.getElementById("step4Back")
      .addEventListener("click",()=>showStep(3));

   document.getElementById("startOverBtn")
      .addEventListener("click",startOver);
}


// ============================================================
// 4. Wizard切换
// ============================================================

function showStep(step) {

   document.querySelectorAll(".step-page")
      .forEach(x=>x.classList.remove("active"));

   document.getElementById(`step${step}`)
      .classList.add("active");


   document.querySelectorAll(".wizard-step")
      .forEach(item=>{

         const n=Number(item.dataset.step);

         item.classList.remove("active","completed");

         if (n===step) {
            item.classList.add("active");
         } else if (n<step) {
            item.classList.add("completed");
         }

      });


   window.scrollTo({
      top:0,
      behavior:"smooth"
   });
}


// ============================================================
// 5. STEP 1
// ============================================================

function getSelectedOmics() {

   return Array.from(
      document.querySelectorAll(".omics-option input:checked")
   ).map(x=>x.value);
}


function updateSelectedOmics() {

   const selected=getSelectedOmics();

   const container=
      document.getElementById("selectedOmics");


   container.innerHTML=
      selected.length>0
         ? selected.map(
              x=>`<span class="omic-chip">${escapeHTML(x)}</span>`
           ).join("")
         : "None";


   document.getElementById("step1Error")
      .classList.add("hidden");
}


function goFromStep1() {

   const selected=getSelectedOmics();


   if (selected.length<2) {

      document.getElementById("step1Error")
         .classList.remove("hidden");

      return;
   }


   filterCombinations(selected);
   renderCombinationTable();


   document.getElementById("step2Omics").innerHTML=
      selected.map(
         x=>`<span class="omic-chip">${escapeHTML(x)}</span>`
      ).join("");


   showStep(2);
}


// ============================================================
// 6. 筛选Combination
// ============================================================

function filterCombinations(selected) {

   const selectedSet=new Set(selected);


   filteredCombinations=combinationData.filter(row=>{

      return OMICS.every(omic=>{

         const required=
            Number(row[`Has_${omic}`])===1;

         return !required ||
            selectedSet.has(omic);
      });

   });


   filteredCombinations.sort((a,b)=>{

      const rankA=toNumber(a.Final_Rank,Infinity);
      const rankB=toNumber(b.Final_Rank,Infinity);

      if (rankA!==rankB) {
         return rankA-rankB;
      }

      return (
         toNumber(a.Final_FR,Infinity) -
         toNumber(b.Final_FR,Infinity)
      );

   });


   selectedCombination=null;
   selectedAlgorithm=null;


   document.getElementById("step2Next").disabled=true;

   document.getElementById("combinationEvaluation")
      .classList.add("hidden");
}


// ============================================================
// 7. STEP 2 Combination表
// ============================================================

function renderCombinationTable() {

   const tbody=
      document.getElementById("combinationTableBody");

   const empty=
      document.getElementById("noCombinationMessage");


   tbody.innerHTML="";


   document.getElementById("combinationCount").textContent=
      `${filteredCombinations.length} combinations`;


   if (filteredCombinations.length===0) {

      empty.classList.remove("hidden");

      return;
   }


   empty.classList.add("hidden");


   filteredCombinations.forEach(row=>{

      const tr=document.createElement("tr");


      tr.innerHTML=`
         <td>
            ${formatRank(row.Final_Rank)}
         </td>

         <td class="combo-name">
            ${escapeHTML(row.Combination)}
         </td>

         <td>
            ${formatNumber(row.Final_FR,4)}
         </td>

         <td>
            ${escapeHTML(row.Support_Algorithms)}
         </td>
      `;


      tr.addEventListener("click",()=>{

         document.querySelectorAll(
            "#combinationTableBody tr"
         ).forEach(
            x=>x.classList.remove("selected-row")
         );


         tr.classList.add("selected-row");


         selectedCombination=row;
         selectedAlgorithm=null;


         renderCombinationEvaluation();


         document.getElementById("step2Next")
            .disabled=false;


         document.getElementById("combinationEvaluation")
            .classList.remove("hidden");


         document.getElementById("combinationDetails")
            .open=false;

      });


      tbody.appendChild(tr);
   });
}


// ============================================================
// 8. STEP 2 Combination Evaluation
// ============================================================

function renderCombinationEvaluation() {

   const row=selectedCombination;


   setText(
      "selectedCombinationName",
      row.Combination
   );


   // Main information

   setText(
      "detailFinalRank",
      formatRank(row.Final_Rank)
   );


   setText(
      "detailFinalFR",
      formatNumber(row.Final_FR,4)
   );


   setText(
      "detailBootstrapMedianRank",
      formatRank(row.Bootstrap_rank_median)
   );


   setText(
      "detailTop20",
      formatPercent(row.Top20_probability)
   );


   // Detailed information

   setText(
      "detailSupportAlgorithms",
      row.Support_Algorithms
   );


   setText(
      "detailSD",
      formatNumber(row.SD_NormRank,4)
   );


   setText(
      "detailRankCI",
      `${formatRank(row.Bootstrap_rank_CI_low)} – ${formatRank(row.Bootstrap_rank_CI_high)}`
   );


   setText(
      "detailTop10",
      formatPercent(row.Top10_probability)
   );


   setText(
      "detailTop5",
      formatPercent(row.Top5_probability)
   );


   setText(
      "detailRank1",
      formatPercent(row.Rank1_probability)
   );


   setText(
      "detailBootstrapFRMean",
      formatNumber(row.Bootstrap_FR_mean,4)
   );


   setText(
      "detailBootstrapFRMedian",
      formatNumber(row.Bootstrap_FR_median,4)
   );


   setText(
      "detailFRCI",
      `${formatNumber(row.Bootstrap_FR_CI_low,4)} – ${formatNumber(row.Bootstrap_FR_CI_high,4)}`
   );


   setText(
      "detailBootstrapRankMean",
      formatNumber(row.Bootstrap_rank_mean,2)
   );


   setText(
      "detailMeanShift",
      formatNumber(row.Mean_abs_rank_shift,2)
   );


   setText(
      "detailBootstrapN",
      row.Bootstrap_N
   );
}


// ============================================================
// 9. Step 2 -> Step 3
// ============================================================

function goFromStep2() {

   if (!selectedCombination) return;


   setText(
      "step3Combination",
      selectedCombination.Combination
   );


   renderAlgorithmTable();


   selectedAlgorithm=null;


   document.getElementById("step3Next")
      .disabled=true;


   showStep(3);
}


// ============================================================
// 10. STEP 3 Algorithm Ranking
// ============================================================

function renderAlgorithmTable() {

   const tbody=
      document.getElementById("algorithmTableBody");


   tbody.innerHTML="";


   const rows=algorithmData
      .filter(
         x=>
            x.Combination_ID===
            selectedCombination.Combination_ID
      )
      .sort((a,b)=>{

         const rankA=
            toNumber(a.Algorithm_Rank,Infinity);

         const rankB=
            toNumber(b.Algorithm_Rank,Infinity);


         if (rankA!==rankB) {
            return rankA-rankB;
         }


         return (
            toNumber(a.NormRank,Infinity) -
            toNumber(b.NormRank,Infinity)
         );

      });


   rows.forEach(row=>{

      const tr=document.createElement("tr");


      tr.innerHTML=`
         <td>
            ${formatRank(row.Algorithm_Rank)}
         </td>

         <td class="algorithm-cell">
            ${escapeHTML(row.Algorithm)}
         </td>

         <td>
            ${formatNumber(row.NormRank,4)}
         </td>

         <td>
            ${formatRank(row.Within_Algorithm_Rank)}
            /
            ${escapeHTML(row.N_Combinations)}
         </td>
      `;


      tr.addEventListener("click",()=>{

         document.querySelectorAll(
            "#algorithmTableBody tr"
         ).forEach(
            x=>x.classList.remove("selected-row")
         );


         tr.classList.add("selected-row");


         selectedAlgorithm=row;


         document.getElementById("step3Next")
            .disabled=false;

      });


      tbody.appendChild(tr);
   });
}


// ============================================================
// 11. Step 3 -> Step 4
// ============================================================

function goFromStep3() {

   if (!selectedAlgorithm) return;


   renderAlgorithmDetails();


   showStep(4);
}


// ============================================================
// 12. STEP 4 Algorithm Details
// ============================================================

function renderAlgorithmDetails() {

   const perf=selectedAlgorithm;


   const meta=metadataData.find(
      x=>
         String(x.Algorithm_ID)===
         String(perf.Algorithm_ID)
   );


   if (!meta) {

      alert(
         `Metadata not found for ${perf.Algorithm_ID}`
      );

      return;
   }


   // Algorithm introduction

   setText(
      "algorithmName",
      meta.Algorithm
   );


   setText(
      "algorithmFullName",
      meta.Full_Name
   );


   setText(
      "algorithmDescription",
      meta.Short_Description
   );


   setText(
      "step4Combination",
      selectedCombination.Combination
   );


   // Main recommendation information

   setText(
      "algRank",
      formatRank(perf.Algorithm_Rank)
   );


   setText(
      "algNormRank",
      formatNumber(perf.NormRank,4)
   );


   setText(
      "algCombinationRank",
      `${formatRank(perf.Within_Algorithm_Rank)} / ${perf.N_Combinations}`
   );


   // Detailed metrics

   setText(
      "algAvgRank",
      formatNumber(perf.Avg_Rank,3)
   );


   setText(
      "algNMI",
      formatNumber(perf.NMI,3)
   );


   setText(
      "algARI",
      formatNumber(perf.ARI,3)
   );


   setText(
      "algAccuracy",
      formatNumber(perf.Accuracy,3)
   );


   setText(
      "algMacroF1",
      formatNumber(perf.MacroF1,3)
   );


   setText(
      "algECP",
      perf.Clinical_ECP_FDR
   );


   setText(
      "algLogRank",
      formatPValue(perf.log_rank_p)
   );


   // Reference

   setText(
      "articleTitle",
      meta.Article_Title
   );


   setText(
      "articleDOI",
      meta.Article_DOI
   );


   setLink(
      "articleLink",
      meta.Article_URL
   );


   setLink(
      "softwareLink",
      meta.Software_URL
   );


   // 每次进入Algorithm详情时默认折叠详细指标

   document.getElementById("performanceDetails")
      .open=false;
}


// ============================================================
// 13. Start Over
// ============================================================

function startOver() {

   selectedCombination=null;
   selectedAlgorithm=null;
   filteredCombinations=[];


   document.querySelectorAll(
      ".omics-option input"
   ).forEach(
      x=>x.checked=true
   );


   updateSelectedOmics();


   document.getElementById("step2Next")
      .disabled=true;


   document.getElementById("step3Next")
      .disabled=true;


   document.getElementById("combinationEvaluation")
      .classList.add("hidden");


   showStep(1);
}


// ============================================================
// 14. 工具函数
// ============================================================

function setText(id,value) {

   document.getElementById(id).textContent=
      value===null ||
      value===undefined ||
      value===""
         ? "-"
         : value;
}


function setLink(id,url) {

   const element=
      document.getElementById(id);


   if (
      !url ||
      String(url).trim()===""
   ) {

      element.style.display="none";

      return;
   }


   element.href=url;
   element.style.display="inline-block";
}


function toNumber(value,fallback=NaN) {

   const n=Number(value);

   return Number.isFinite(n)
      ? n
      : fallback;
}


function formatNumber(value,digits=3) {

   const n=Number(value);

   return Number.isFinite(n)
      ? n.toFixed(digits)
      : "-";
}


function formatRank(value) {

   const n=Number(value);


   if (!Number.isFinite(n)) {
      return "-";
   }


   return Number.isInteger(n)
      ? String(n)
      : n.toFixed(1);
}


function formatPercent(value) {

   const n=Number(value);

   return Number.isFinite(n)
      ? `${(n*100).toFixed(1)}%`
      : "-";
}


function formatPValue(value) {

   const n=Number(value);


   if (!Number.isFinite(n)) {
      return "-";
   }


   return n<0.001
      ? n.toExponential(2)
      : n.toFixed(4);
}


function escapeHTML(value) {

   if (
      value===null ||
      value===undefined
   ) {
      return "";
   }


   return String(value)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
}