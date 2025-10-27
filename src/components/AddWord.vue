<template>
  <div class="add-word-container">
    <!-- 背景装饰元素 -->
    <div class="background-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-gradient"></div>
    </div>
    
    <div class="container">
      <!-- 主卡片 -->
      <el-card class="add-word-card gradient-card">
        <template #header>
          <div class="card-header">
            <div class="header-icon">
              <i class="fas fa-plus-circle"></i>
            </div>
            <h2 class="gradient-text">添加单词</h2>
          </div>
        </template>
        
        <el-form
          ref="wordFormRef"
          :model="wordForm"
          :rules="rules"
          label-width="100px"
          class="word-form"
          @submit.prevent
        >
          <!-- 基础信息区域 -->
          <div class="form-section">
            <h3 class="section-title">基础信息</h3>
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item label="英语单词" prop="word">
                  <el-input
                    v-model="wordForm.word"
                    placeholder="请输入单词"
                    class="form-input"
                    clearable
                    @input="handleWordInput"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="音标" prop="phonetic">
                  <el-input
                    v-model="wordForm.phonetic"
                    placeholder="例如: /wɜːd/"
                    class="form-input"
                    clearable
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="词性" prop="partOfSpeech">
              <el-select
                v-model="wordForm.partOfSpeech"
                placeholder="请选择词性"
                class="form-select"
                clearable
              >
                <el-option label="名词" value="n."></el-option>
                <el-option label="动词" value="v."></el-option>
                <el-option label="形容词" value="adj."></el-option>
                <el-option label="副词" value="adv."></el-option>
                <el-option label="介词" value="prep."></el-option>
                <el-option label="连词" value="conj."></el-option>
                <el-option label="代词" value="pron."></el-option>
                <el-option label="数词" value="num."></el-option>
                <el-option label="感叹词" value="interj."></el-option>
                <el-option label="其他" value="other"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="中文意思" prop="meaning">
              <el-input
                v-model="wordForm.meaning"
                type="textarea"
                rows="3"
                placeholder="请输入中文意思"
                class="form-textarea"
                resize="vertical"
              ></el-input>
            </el-form-item>
          </div>

          <!-- 扩展信息区域 -->
          <div class="form-section">
            <h3 class="section-title">扩展信息</h3>
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item label="标签" prop="tags">
                  <el-input
                    v-model="wordForm.tags"
                    placeholder="用逗号分隔，例如：常用, 商务"
                    class="form-input"
                    clearable
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="日期" prop="date">
                  <el-date-picker
                    v-model="wordForm.date"
                    type="date"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD"
                    class="form-datepicker"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="例句" prop="example">
              <el-input
                v-model="wordForm.example"
                type="textarea"
                rows="2"
                placeholder="请输入例句"
                class="form-textarea"
                resize="vertical"
              ></el-input>
            </el-form-item>
            
            <el-form-item label="同义词/反义词" prop="synonyms">
              <el-input
                v-model="wordForm.synonyms"
                placeholder="用逗号分隔"
                class="form-input"
                clearable
              ></el-input>
            </el-form-item>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <el-button
              @click="resetForm"
              :loading="submitting"
              class="clear-btn"
            >
              <i class="fas fa-redo"></i>
              重置
            </el-button>
            <el-button
              @click="submitForm"
              :loading="submitting"
              class="search-btn"
            >
              <i class="fas fa-save"></i>
              保存单词
            </el-button>
          </div>
        </el-form>
      </el-card>

      <!-- 导入导出区域 -->
      <el-card class="import-export-card gradient-card">
        <template #header>
          <div class="card-header">
            <div class="header-icon">
              <i class="fas fa-exchange-alt"></i>
            </div>
            <h2 class="gradient-text">导入导出</h2>
          </div>
        </template>
        
        <div class="import-export-content">
          <el-button
            type="primary"
            plain
            @click="triggerFileInput"
            class="import-btn"
          >
            <i class="fas fa-upload mr-1"></i>
            导入JSON文件
          </el-button>
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleFileImport"
          >
          <el-button
            type="info"
            plain
            @click="exportWordsAsJson"
            class="export-btn"
          >
            <i class="fas fa-download mr-1"></i>
            导出JSON文件
          </el-button>
        </div>
      </el-card>

      <!-- 快速添加区域 -->
      <el-card class="quick-add-card gradient-card">
        <template #header>
          <div class="card-header">
            <div class="header-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <h2 class="gradient-text">快速添加</h2>
          </div>
        </template>
        
        <div class="quick-add-content">
          <el-input
            v-model="quickAddText"
            placeholder="格式：单词-释义，例如：apple-苹果"
            class="form-input quick-add-input"
            clearable
            @keyup.enter="quickAdd"
            show-word-limit
            maxlength="100"
          ></el-input>
          <el-button
            @click="quickAdd"
            :loading="submitting"
            class="quick-add-btn"
          >
            <i class="fas fa-plus"></i>
            快速添加
          </el-button>
        </div>
        
        <div v-if="recentAddedWords.length > 0" class="recent-words">
          <h4>最近添加：</h4>
          <div class="recent-words-list">
            <el-tag
              v-for="(word, index) in recentAddedWords"
              :key="index"
              :closable="true"
              :effect="'plain'"
              class="recent-word-tag"
              @close="removeRecentWord(index)"
            >
              {{ word }}
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'AddWord',
  emits: ['word-added'],
  setup(props, { emit }) {
    const wordFormRef = ref(null)
    const fileInputRef = ref(null)
    const submitting = ref(false)
    const quickAddText = ref('')
    const recentAddedWords = ref([])
    
    // 单词表单数据
    const wordForm = reactive({
      word: '',
      phonetic: '',
      partOfSpeech: '',
      meaning: '',
      example: '',
      tags: '',
      synonyms: '',
      date: new Date().toISOString().split('T')[0]
    })
    
    // 表单验证规则
    const rules = {
      word: [
        { required: true, message: '请输入单词', trigger: 'blur' },
        { pattern: /^[\w\s\-\']+$/, message: '单词不能包含中文字符或特殊字符', trigger: 'blur' }
      ],
      meaning: [
        { required: true, message: '请输入中文意思', trigger: 'blur' }
      ],
      date: [
        { required: true, message: '请选择日期', trigger: 'change' }
      ]
    }

    // 处理单词输入
    const handleWordInput = () => {
      // 自动将单词转换为小写
      wordForm.word = wordForm.word.toLowerCase()
    }

    // 验证单词是否已存在
    const checkWordExists = (word) => {
      const savedWords = localStorage.getItem('dailyEnglishWords')
      if (!savedWords) return false
      
      const words = JSON.parse(savedWords)
      return words.some(w => w.word.toLowerCase() === word.toLowerCase())
    }

    // 保存单词
    const saveWord = () => {
      // 处理标签
      const tags = wordForm.tags
        ? wordForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : []
      
      // 创建新单词对象
      const newWord = {
        id: Date.now().toString(),
        word: wordForm.word.trim(),
        phonetic: wordForm.phonetic.trim(),
        partOfSpeech: wordForm.partOfSpeech,
        meaning: wordForm.meaning.trim(),
        example: wordForm.example.trim(),
        tags,
        synonyms: wordForm.synonyms.trim(),
        date: wordForm.date
      }
      
      // 获取已有单词
      const savedWords = localStorage.getItem('dailyEnglishWords')
      const words = savedWords ? JSON.parse(savedWords) : []
      
      // 添加新单词
      words.push(newWord)
      
      // 保存到本地存储
      localStorage.setItem('dailyEnglishWords', JSON.stringify(words))
      
      // 更新最近添加的单词
      recentAddedWords.value.unshift(newWord.word)
      if (recentAddedWords.value.length > 5) {
        recentAddedWords.value = recentAddedWords.value.slice(0, 5)
      }
      
      // 发送单词已添加事件
      emit('word-added', newWord)
      
      // 触发自定义事件，通知其他组件单词已更新
      const event = new CustomEvent('wordUpdated', { detail: newWord })
      window.dispatchEvent(event)
      
      return newWord
    }

    // 提交表单
    const submitForm = () => {
      wordFormRef.value?.validate(async (valid) => {
        if (valid) {
          // 检查单词是否已存在
          if (checkWordExists(wordForm.word)) {
            ElMessage.warning('该单词已存在，请检查是否拼写错误或尝试添加其他单词')
            return
          }
          
          submitting.value = true
          
          try {
            // 模拟异步操作
            await new Promise(resolve => setTimeout(resolve, 500))
            
            saveWord()
            
            ElMessage.success({
              message: '单词添加成功！',
              duration: 2000,
              showClose: true
            })
            
            // 重置表单
            resetForm()
          } catch (error) {
            console.error('添加单词失败:', error)
            ElMessage.error('添加单词失败，请重试')
          } finally {
            submitting.value = false
          }
        }
      })
    }

    // 重置表单
    const resetForm = () => {
      wordFormRef.value?.resetFields()
      Object.assign(wordForm, {
        word: '',
        phonetic: '',
        partOfSpeech: '',
        meaning: '',
        example: '',
        tags: '',
        synonyms: '',
        date: new Date().toISOString().split('T')[0]
      })
    }

    // 快速添加单词
    const quickAdd = () => {
      if (!quickAddText.value.trim()) {
        ElMessage.warning('请输入单词和释义')
        return
      }
      
      const parts = quickAddText.value.trim().split('-')
      if (parts.length < 2) {
        ElMessage.warning('格式错误，请使用：单词-释义')
        return
      }
      
      const word = parts[0].trim()
      const meaning = parts.slice(1).join('-').trim()
      
      if (!word || !meaning) {
        ElMessage.warning('单词和释义不能为空')
        return
      }
      
      // 检查单词是否已存在
      if (checkWordExists(word)) {
        ElMessage.warning('该单词已存在')
        quickAddText.value = ''
        return
      }
      
      submitting.value = true
      
      try {
        // 更新表单数据
        wordForm.word = word
        wordForm.meaning = meaning
        
        // 保存单词
        saveWord()
        
        ElMessage.success({
          message: '快速添加成功！',
          duration: 1500,
          showClose: true
        })
        
        // 清空快速添加输入
        quickAddText.value = ''
        
        // 重置表单的其他字段，但保留当前日期
        const currentDate = wordForm.date
        resetForm()
        wordForm.date = currentDate
      } catch (error) {
        console.error('快速添加失败:', error)
        ElMessage.error('添加失败，请重试')
      } finally {
        submitting.value = false
      }
    }

    // 移除最近添加的单词
    const removeRecentWord = (index) => {
      recentAddedWords.value.splice(index, 1)
    }
    
    // 触发文件输入
    const triggerFileInput = () => {
      fileInputRef.value?.click()
    }
    
    // 处理文件导入
    const handleFileImport = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result)
          
          // 验证导入的数据格式
          if (!Array.isArray(importedData)) {
            throw new Error('导入的数据格式错误，需要是单词数组')
          }
          
          // 处理每个单词，确保包含必要字段
          const validWords = importedData.map(word => {
            const validWord = {
              id: word.id || Date.now().toString() + Math.random(),
              word: word.word || word.单词 || word.name || '',
              phonetic: word.phonetic || word.音标 || '',
              partOfSpeech: word.partOfSpeech || word.词性 || '',
              meaning: word.meaning || word.释义 || word.中文 || '',
              example: word.example || word.例句 || '',
              tags: word.tags || (word.标签 ? word.标签.split(',').map(tag => tag.trim()) : []),
              date: word.date || new Date().toISOString().split('T')[0]
            }
            
            // 确保日期格式正确
            if (!validWord.date.includes('-')) {
              validWord.date = new Date().toISOString().split('T')[0]
            }
            
            return validWord
          }).filter(word => word.word && word.meaning)
          
          if (validWords.length === 0) {
            ElMessage.warning('没有找到有效的单词数据')
            return
          }
          
          // 获取现有单词
          const savedWords = localStorage.getItem('dailyEnglishWords')
          const existingWords = savedWords ? JSON.parse(savedWords) : []
          
          // 合并单词，避免重复
          const wordMap = new Map()
          
          // 先添加现有单词
          existingWords.forEach(word => {
            wordMap.set(word.word.toLowerCase(), word)
          })
          
          // 添加新单词（不覆盖现有单词）
          let newWordsCount = 0
          validWords.forEach(word => {
            const key = word.word.toLowerCase()
            if (!wordMap.has(key)) {
              wordMap.set(key, word)
              newWordsCount++
              
              // 添加到最近添加列表
              recentAddedWords.value.unshift(word.word)
              if (recentAddedWords.value.length > 5) {
                recentAddedWords.value = recentAddedWords.value.slice(0, 5)
              }
            }
          })
          
          // 保存合并后的单词列表
          const updatedWords = Array.from(wordMap.values())
          localStorage.setItem('dailyEnglishWords', JSON.stringify(updatedWords))
          
          // 通知其他组件更新
          window.dispatchEvent(new CustomEvent('wordUpdated'))
          
          ElMessage.success({
            message: `成功导入 ${newWordsCount} 个单词，共 ${updatedWords.length} 个单词`,
            duration: 3000
          })
          
        } catch (error) {
          console.error('导入失败:', error)
          ElMessage.error('导入失败，请检查文件格式是否正确')
        } finally {
          // 清空文件输入
          if (fileInputRef.value) {
            fileInputRef.value.value = ''
          }
        }
      }
      
      reader.onerror = () => {
        ElMessage.error('文件读取失败')
        if (fileInputRef.value) {
          fileInputRef.value.value = ''
        }
      }
      
      reader.readAsText(file, 'UTF-8')
    }
    
    // 导出为JSON文件
    const exportWordsAsJson = () => {
      const savedWords = localStorage.getItem('dailyEnglishWords')
      const words = savedWords ? JSON.parse(savedWords) : []
      
      if (words.length === 0) {
        ElMessage.warning('没有单词可导出')
        return
      }
      
      const dataStr = JSON.stringify(words, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `单词数据_${new Date().toLocaleDateString()}.json`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      ElMessage.success('导出成功')
    }

    // 监听窗口大小变化，调整表单布局
    const handleResize = () => {
      // 这里可以添加响应式布局调整逻辑
    }

    // 组件挂载时
    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })

    // 监听表单变化，提供实时反馈
    watch(
      () => [wordForm.word, wordForm.meaning],
      ([newWord, newMeaning]) => {
        // 这里可以添加实时验证逻辑
      }
    )

    return {
      wordFormRef,
      fileInputRef,
      wordForm,
      rules,
      submitting,
      quickAddText,
      recentAddedWords,
      handleWordInput,
      submitForm,
      resetForm,
      quickAdd,
      removeRecentWord,
      triggerFileInput,
      handleFileImport,
      exportWordsAsJson
    }
  }
}
</script>

<style scoped>
/* CSS变量 */
:root {
  --primary-color: #4361ee;
  --primary-light: #4895ef;
  --secondary-color: #3f37c9;
  --success-color: #4cc9f0;
  --danger-color: #f72585;
  --warning-color: #ff9f1c;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-tertiary: #adb5bd;
  --background-card: #ffffff;
  --background-hover: #f8f9fa;
  --background-tag: #f8f9fa;
  --border-color: #dee2e6;
  --border-color-light: #e9ecef;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --transition-fast: 0.15s;
  --transition-normal: 0.3s;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-bounce: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --gradient-primary: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  --gradient-secondary: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
  --gradient-success: linear-gradient(135deg, #4cc9f0, #4895ef);
  --gradient-warning: linear-gradient(135deg, #ff9f1c, #ffbe0b);
  --gradient-card: linear-gradient(145deg, #ffffff, #f8f9fa);
  --gradient-light: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.add-word-container {
  padding: var(--space-xl);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-xl);
  animation: fadeIn 0.5s var(--ease-out);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 背景装饰元素 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.bg-circle-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  top: -250px;
  right: -250px;
}

.bg-circle-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, var(--danger-color) 0%, var(--secondary-color) 100%);
  bottom: -200px;
  left: -200px;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%);
  z-index: 1;
}

.container {
  position: relative;
  z-index: 2;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent !important;
  border-bottom: none !important;
  padding: var(--space-md) var(--space-lg) var(--space-md) var(--space-lg) !important;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
  animation: float 6s ease-in-out infinite;
}

.gradient-text {
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.5s var(--ease-out);
  margin: 0;
}

.add-word-card, .quick-add-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(10px);
  transition: all var(--transition-normal) var(--ease-bounce);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
  margin-bottom: var(--space-xl);
}

.add-word-card::before, .quick-add-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--danger-color), var(--success-color));
  opacity: 0;
  transition: opacity var(--transition-normal) var(--ease-out);
}

.add-word-card:hover::before, .quick-add-card:hover::before {
  opacity: 1;
}

.add-word-card .card-header, .quick-add-card .card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border-bottom: none;
  padding: var(--space-md) var(--space-lg) var(--space-md) var(--space-lg);
}

.add-word-card .card-header h2, .quick-add-card .card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-word-card .card-header h2 i, .quick-add-card .card-header h2 i {
  display: none;
}

.add-word-card .card-header h2 i {
  font-size: 1.2rem;
  color: var(--primary-color);
  animation: pulse 2s infinite;
}

.quick-add-card .card-header h2 i {
  font-size: 1.2rem;
  color: var(--success-color);
  animation: bounce 1.5s infinite;
}

/* 表单样式 */
.word-form {
  padding: var(--space-lg);
}

.form-section {
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
  background: var(--gradient-light);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
  transition: all var(--transition-normal) ease;
}

.form-section:hover {
  box-shadow: var(--shadow-sm);
}

.section-title {
  margin: 0 0 var(--space-lg);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-light);
  padding-bottom: 8px;
  display: inline-block;
}

.form-input,
.form-select,
.form-datepicker,
.form-textarea {
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal) ease;
  border-color: var(--border-color-light);
}

.form-input:focus,
.form-select:focus,
.form-datepicker:focus,
.form-textarea:focus {
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
  border-color: var(--primary-light);
}

.form-textarea {
  min-height: 80px;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-color-light);
}

.action-btn {
  min-width: 120px;
  border-radius: var(--radius-full);
  font-size: 1rem;
  padding: 10px 24px;
  transition: all var(--transition-normal) ease;
  border-width: 2px;
}

.submit-btn {
  background: var(--gradient-primary);
  border: none;
  color: white;
}

.submit-btn:hover {
  background: var(--gradient-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.reset-btn {
  border-color: var(--border-color-light);
}

.reset-btn:hover {
  border-color: var(--text-tertiary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* 快速添加区域样式 */
.quick-add-content {
  padding: var(--space-lg);
  display: flex;
  gap: var(--space-md);
  align-items: stretch;
}

.quick-add-input {
  flex: 1;
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal) ease;
}

.quick-add-input:focus {
  box-shadow: 0 0 0 2px rgba(76, 201, 240, 0.2);
  border-color: var(--success-color);
}

.quick-add-btn {
  border-radius: var(--radius-full);
  background: var(--gradient-success);
  border: none;
  color: white;
  transition: all var(--transition-normal) ease;
  /* 移除nowrap属性，允许文本在必要时换行 */
  min-width: 100px;
  font-size: 1rem;
}

.quick-add-btn:hover {
  background: var(--success-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 最近添加区域样式 */
.recent-words {
  padding: 0 var(--space-lg) var(--space-lg);
}

.recent-words h4 {
  margin: 0 0 var(--space-md);
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.recent-words-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.recent-word-tag {
  border-radius: var(--radius-full);
  transition: all var(--transition-fast) ease;
  animation: fadeIn 0.5s var(--ease-out);
}

.recent-word-tag:hover {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  border-color: transparent;
}

/* 动画定义 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .add-word-container {
    padding: var(--space-md);
    gap: var(--space-lg);
  }
  
  .add-word-card .card-header h2,
  .quick-add-card .card-header h2 {
    font-size: 1.3rem;
  }
  
  .word-form {
    padding: var(--space-md);
  }
  
  .form-section {
    padding: var(--space-md);
    margin-bottom: var(--space-lg);
  }
  
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .quick-add-content {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .quick-add-btn {
    width: 100%;
    /* 移动端确保按钮文本完整显示 */
    white-space: normal;
    font-size: 0.9rem;
    padding: 10px 16px;
  }
  
  .recent-words-list {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .add-word-container {
    padding: var(--space-sm);
  }
  
  .word-form {
    padding: var(--space-sm);
  }
  
  .form-section {
    padding: var(--space-sm);
  }
  
  .quick-add-content {
    padding: var(--space-sm);
  }
  
  .recent-words {
    padding: 0 var(--space-sm) var(--space-sm);
  }
}

/* 表单验证样式 */
:deep(.el-form-item__error) {
  font-size: 0.875rem;
  color: var(--danger-color);
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-3px);
  }
  75% {
    transform: translateX(3px);
  }
}

/* 加载状态样式 */
:deep(.el-loading-spinner .path) {
  stroke: var(--primary-color);
}

/* 输入框聚焦动画 */
.form-input,
.form-textarea,
.form-select,
.form-datepicker {
  position: relative;
  overflow: hidden;
}

.form-input:focus::after,
.form-textarea:focus::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(67, 97, 238, 0.1), transparent);
  animation: shimmer 1s;
}

@keyframes shimmer {
  100% {
    left: 100%;
  }
}
</style>