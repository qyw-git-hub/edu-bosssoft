// 组件
import wTitle from "./components/wTitle.vue";
import wAlert from "./components/wAlert.vue";
import wSwitch from "./components/wSwitch.vue";
import wTable from "./components/wTable.vue";
import wDialog from "./components/wDialog/index.vue";
import filedView from "./components/wDialog/filedView.vue";
import wTreeSelectMult from "./components/wTreeSelect/multiple.vue";
import wTreeSelectSingle from "./components/wTreeSelect/single.vue";
import multipleLeft from "./components/wTreeSelect/multipleLeft.vue";
import treeMultipleDialog from "./components/wTreeSelect/treeMultipleDialog.vue";
import multiInput from "./components/select/multiInput.vue";
import formItemGeneratorGoods from "./components/formItemGenerator/goods.vue";
import exmineWithProcess from "./components/wExmine/exmineWithProcess.vue";
import wExmine from "./components/wExmine/index.vue";
import svgIcon from "./components/svgIcon.vue";
import wStep from "./components/step/index.vue";
import wStepExmine from "./components/step/exmine.vue";
import selectLong from "./components/wDatePicker/selectLong.vue";
import weekSelect from "./components/wDatePicker/weekSelect.vue";
import wCollapseButtons from "./components/wCollapseButtons.vue";

const components = [wTitle, wAlert, wSwitch, wTable, wDialog, filedView, wTreeSelectMult, wTreeSelectSingle, multipleLeft, multiInput, treeMultipleDialog, formItemGeneratorGoods, exmineWithProcess, wExmine, svgIcon, wStep, wStepExmine, selectLong, weekSelect, wCollapseButtons];

const install = (Vue) => {
  if (install.installed) return;
  install.installed = true;
  components.forEach((component) => {
    if (component.name) {
      Vue.component(component.name, component);
    }
  });
};

// 检测到 Vue 再执行
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

// 导出单个组件
export { wTitle, wAlert, wSwitch, wTable, wDialog, filedView, wTreeSelectMult, wTreeSelectSingle, multipleLeft, multiInput, treeMultipleDialog, formItemGeneratorGoods, exmineWithProcess, wExmine, svgIcon, wStep, wStepExmine, selectLong, weekSelect, wCollapseButtons };

// 导出全部组件
export default {
  install,
  // 所有组件，必须具有 install 方法才能使用 Vue.use()
  ...components.reduce((acc, component) => {
    if (component.name) {
      acc[component.name] = component;
    }
    return acc;
  }, {}),
};