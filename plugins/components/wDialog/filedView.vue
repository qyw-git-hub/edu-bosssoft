<template>
  <!--
 * @Author: 秦雅雯 qinyawen@bosssoft.com.cn
 * @Date: 2024-07-31 12:42:00
 * @description: 文件查看，当多张图片则显示list列表，单张图片则直接显示，若是文件格式则直接浏览器打开
 * @use:  <filedView :visible.sync="visible" :file-list="list" />
  -->
  <div>
    <w-dialog
      :visible.sync="isShow"
      :params="dialogParams"
      :close-on-click-modal="false"
      @open="onOpen"
      @close="onClose"
    >
      <ul class="filedView">
        <li v-for="(item,index) in fileList" :key="index">
          <p class="l_text">
            <i class="el-icon-folder-opened mr5"></i>
            <el-tooltip class="item" effect="dark" :content="item.fileName" placement="top-start">
              <span>{{item.fileName}}</span>
            </el-tooltip>
          </p>
          <p class="r_text" @click="onView(item)">查看附件</p>
        </li>
      </ul>
    </w-dialog>
    <el-image-viewer
      v-if="isImageViewer"
      :zIndex="9999"
      :url-list="imgList"
      :initialIndex="initialIndex"
      hide-on-click-modal
      :on-close="onCloseViewer"
    />
  </div>
</template>

<script>
import { extractFileType } from '../../utils/common.js';
import wDialog from './index.vue';
import elImageViewer from 'element-ui/packages/image/src/image-viewer'
export default {
  components: {
    wDialog,
    'el-image-viewer': elImageViewer
  },
  props: {
    visible: Boolean,
    fileList: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      dialogParams: { title: '查看附件', width: '500px', hiddenSubmitBtn: true },
      imgList: [],
      isImageViewer: false,
      list: [],
      initialIndex: 0,
      isShow: false
    }
  },
  watch: {
    visible(value) {
      if (value) {
        if (this.fileList.length <= 1) {
          this.initialIndex = 0
          this.imgList = [this.fileList[0].fileUrl]
          this.onView(this.fileList[0])
        } else {
          this.isShow = true
        }
      }
    }
  },
  methods: {
    /* 打开弹窗监听 */
    onOpen() {
      this.imgList = this.fileList.filter(f => extractFileType(f.fileUrl).isImg).map(m => m.fileUrl)
      let i = 0
      this.list = this.fileList.map(m => {
        if (extractFileType(m.fileUrl).isImg) {
          m.initialIndex = i
          i++
        }
        return m
      })
    },
    onView(item) {
      if (extractFileType(item.fileUrl).isImg) { /* 是图片 */
        this.initialIndex = item.initialIndex
        this.isImageViewer = true
      } else {
        window.open(item.fileUrl);
      }
    },
    onCloseViewer() {
      if (this.fileList.length <= 1) {
        this.onClose()
      }
      this.isImageViewer = false
    },
    onClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>