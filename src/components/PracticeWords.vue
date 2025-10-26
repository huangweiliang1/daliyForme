<template>
  <div class="practice-words">
    <!-- 标题和返回按钮 -->
    <div class="practice-header">
      <div v-if="currentStep !== 'mode-selection'" class="back-button">
        <button @click="goBack" class="back-btn">返回</button>
      </div>
      <h2>单词练习</h2>
    </div>
    <!-- 模式选择 -->
    <div v-if="currentStep === 'mode-selection'" class="mode-selection">
      <h2>选择练习模式</h2>
      <div class="mode-cards">
        <div class="mode-card" @click="selectMode('flashcard')">
          <i class="fas fa-card"></i>
          <h3>闪卡模式</h3>
          <p>通过翻转卡片学习单词和释义</p>
        </div>
        <div class="mode-card" @click="selectMode('quiz')">
          <i class="fas fa-question-circle"></i>
          <h3>测验模式</h3>
          <p>测试你的单词记忆</p>
        </div>
        <div class="mode-card" @click="selectMode('listening')">
          <i class="fas fa-headphones"></i>
          <h3>听力模式</h3>
          <p>练习听力理解</p>
        </div>
      </div>
    </div>

    <!-- 练习设置 -->
    <div v-else-if="currentStep === 'settings'" class="practice-settings">
      <h2>练习设置</h2>
      
      <div class="settings-group">
        <label>练习单词数量</label>
        <input 
          type="number" 
          v-model="settings.wordCount" 
          min="1" 
          max="50"
          placeholder="输入单词数量"
        >
      </div>
      
      <div class="settings-group">
        <label>难度级别</label>
        <select v-model="settings.difficulty">
          <option value="全部">全部</option>
          <option value="简单">简单</option>
          <option value="中等">中等</option>
          <option value="困难">困难</option>
        </select>
      </div>
      
      <div class="settings-group">
        <label>单词范围</label>
        <div class="radio-group">
          <label>
            <input type="radio" v-model="settings.wordRange" value="today">
            今天的单词
          </label>
          <label>
            <input type="radio" v-model="settings.wordRange" value="all">
            所有单词
          </label>
        </div>
      </div>
      
      <div class="settings-actions">
        <button class="back-btn" @click="() => { backToModeSelection(); refreshPage(); }">返回</button>
        <button class="start-btn" @click="startPractice" :disabled="loading">
          {{ loading ? '准备中...' : '开始练习' }}
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在准备练习内容...</p>
    </div>



    <!-- 闪卡模式 -->
    <div v-if="currentStep === 'flashcard' && practiceWords.length > 0" class="flashcard-mode">
      <!-- 通用进度条 -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span>{{ currentIndex + 1 }} / {{ practiceWords.length }}</span>
      </div>
      <div class="flashcard-container">
        <div class="flashcard" :class="{ flipped: isFlipped }" @click="flipCard">
          <div class="card-front">
            <h3>{{ currentWord.word }}</h3>
            <p v-if="currentWord.phonetic">{{ currentWord.phonetic }}</p>
          </div>
          <div class="card-back">
            <h4>释义</h4>
            <p class="definition">{{ currentWord.meaning }}</p>
            <div v-if="currentWord.phonetic" class="phonetic">
              <span>{{ currentWord.phonetic }}</span>
            </div>
            <p v-if="currentWord.example" class="example">{{ currentWord.example }}</p>
          </div>
        </div>
      </div>

      <div class="flashcard-actions">
        <button class="audio-btn" @click="playSound(currentWord.word)">
          <i class="fas fa-volume-up"></i>
          发音
        </button>
        <button class="flip-hint-btn" @click="flipCard">
          {{ isFlipped ? '查看单词' : '查看释义' }}
        </button>
      </div>

      <div class="navigation-buttons">
        <button 
          class="nav-btn" 
          @click="prevWord"
          :disabled="currentIndex === 0"
        >
          上一个
        </button>
        <button 
          class="nav-btn" 
          @click="nextWord"
          :disabled="currentIndex === practiceWords.length - 1"
        >
          {{ currentIndex === practiceWords.length - 1 ? '完成练习' : '下一个' }}
        </button>
      </div>
    </div>

    <!-- 测验模式 -->
    <div v-else-if="currentStep === 'quiz' && practiceWords.length > 0" class="quiz-mode">
      <!-- 通用进度条 -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span>{{ currentIndex + 1 }} / {{ practiceWords.length }}</span>
      </div>

      <div class="quiz-question">
        <h3>请选择单词 "{{ currentWord.word }}" 的正确释义</h3>
      </div>

      <div class="quiz-options">
        <div 
          v-for="(option, index) in quizOptions" 
          :key="index"
          class="quiz-option"
          :class="{ 
            selected: selectedOption === index,
            // 选择的答案是否正确
            correct: showResult && selectedOption === index && isCorrect,
            // 选择的答案是否错误
            incorrect: showResult && selectedOption === index && !isCorrect,
            // 同时显示正确的答案（无论是否选择）
            'correct-answer': showResult && 
                             String(option).replace(/\s+/g, '').toLowerCase() === 
                             String(currentWord.meaning).replace(/\s+/g, '').toLowerCase()
          }"
          @click="selectOption(index)"
        >
          <span>{{ option }}</span>
        </div>
      </div>

      <div v-if="showResult" class="quiz-result">
        <div v-if="isCorrect" class="correct-result">
          <p>✓ 正确！</p>
        </div>
        <div v-else class="wrong-result">
          <p>✗ 错误</p>
          <p>正确答案: {{ currentWord.meaning }}</p>
        </div>
      </div>

      <div class="quiz-actions">
        <button 
          v-if="!showResult" 
          class="submit-btn" 
          @click="submitQuiz"
          :disabled="selectedOption === -1"
        >
          提交
        </button>
        <button 
          v-else 
          class="next-btn" 
          @click="nextQuiz"
        >
          {{ currentIndex === practiceWords.length - 1 ? '查看结果' : '下一题' }}
        </button>
      </div>
    </div>

    <!-- 听力模式 -->
    <div v-else-if="currentStep === 'listening' && practiceWords.length > 0" class="listening-mode">
      <!-- 通用进度条 -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span>{{ currentIndex + 1 }} / {{ practiceWords.length }}</span>
      </div>

      <div class="listening-content">
        <button class="play-audio-btn" @click="playSound(currentWord.word)">
          <i class="fas fa-volume-up"></i>
          播放发音
        </button>
        
        <p class="listen-hint">请选择听到的单词</p>
        
        <div class="options">
          <button 
            v-for="(option, index) in listeningOptions" 
            :key="index"
            class="option-btn"
            :class="{ 
              'selected': selectedOption === index,
              'correct': showResult && index === correctOptionIndex,
              'incorrect': showResult && selectedOption === index && selectedOption !== correctOptionIndex
            }"
            @click="selectOption(index)"
          >
            {{ option }}
          </button>
        </div>
        
        <div class="listening-actions">
          <button 
            v-if="!showResult" 
            class="submit-btn" 
            @click="submitQuiz"
            :disabled="selectedOption === -1"
          >
            提交
          </button>
          <button 
            v-else 
            class="next-quiz-btn" 
            @click="nextQuiz"
          >
            {{ currentIndex === practiceWords.length - 1 ? '查看结果' : '下一题' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 练习结果 -->
    <div v-else-if="currentStep === 'result'" class="practice-result">
      <div class="result-card">
        <div class="result-header">
          <h3>练习完成！</h3>
        </div>
        
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-number">{{ results.correct }}</span>
            <span class="stat-label">正确</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ results.total }}</span>
            <span class="stat-label">总题数</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ results.score }}%</span>
            <span class="stat-label">正确率</span>
          </div>
        </div>
        
        <div class="result-actions">
          <button class="result-btn" @click="() => { restartPractice(); refreshPage(); }">
            <i class="fas fa-redo"></i>
            重新练习
          </button>
          <button class="result-btn" @click="() => { backToModeSelection(); refreshPage(); }">
            <i class="fas fa-home"></i>
            返回首页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'PracticeWords',
  setup() {
    // 练习状态 - 确保初始状态为模式选择
    const currentStep = ref('mode-selection') // mode-selection, settings, flashcard, quiz, listening, result
    const currentMode = ref('')
    const currentIndex = ref(0)
    const practiceWords = ref([])
    const loading = ref(false)
    
    // 确保页面加载时重置到初始状态
    onMounted(() => {
      currentStep.value = 'mode-selection'
      currentMode.value = ''
      currentIndex.value = 0
      practiceWords.value = []
      loading.value = false
    })
    
    // 闪卡模式相关
    const isFlipped = ref(false)
    
    // 测验模式相关
    const quizOptions = ref([])
    const listeningOptions = ref([])
    const selectedOption = ref(-1)
    const showResult = ref(false)
    const correctOptionIndex = ref(-1)
    
    // 练习设置
    const settings = ref({
      wordCount: 10,
      difficulty: '全部',
      wordRange: 'today' // today, all
    })
    
    // 练习结果
    const results = ref({
      correct: 0,
      total: 0,
      score: 0
    })
    
    // 当前单词
    const currentWord = computed(() => {
      return practiceWords.value[currentIndex.value] || { word: '', meaning: '', phonetic: '', example: '' }
    })
    
    // 进度百分比
    const progressPercentage = computed(() => {
      if (practiceWords.value.length === 0) return 0
      return ((currentIndex.value + 1) / practiceWords.value.length) * 100
    })
    
    // 选择练习模式
    const selectMode = (mode) => {
      currentMode.value = mode
      currentStep.value = 'settings'
    }
    
    // 开始练习
    const startPractice = async () => {
      loading.value = true
      
      try {
        // 加载单词数据
        const savedWords = localStorage.getItem('dailyEnglishWords')
        let allWords = savedWords ? JSON.parse(savedWords) : []
        
        // 根据选择的范围过滤单词
        if (settings.value.wordRange === 'today') {
          const today = new Date()
          const todayDateStr = today.toISOString().split('T')[0]
          allWords = allWords.filter(word => {
            // 直接比较日期字符串，避免日期转换问题
            return word.date === todayDateStr
          })
        }
        
        // 根据难度级别过滤单词
        if (settings.value.difficulty && settings.value.difficulty !== '全部') {
          allWords = allWords.filter(word => {
            // 如果单词没有难度属性或者难度为空，则根据复习次数估算难度
            const wordDifficulty = word.difficulty || estimateDifficulty(word)
            return matchDifficultyLevel(wordDifficulty, settings.value.difficulty)
          })
        }
        
        // 如果没有单词数据，显示提示
        if (allWords.length === 0) {
          ElMessage.warning('没有找到匹配条件的单词数据，请先添加单词')
          loading.value = false
          return
        }
        
        // 随机选择单词
        const shuffled = [...allWords].sort(() => 0.5 - Math.random())
        practiceWords.value = shuffled.slice(0, Math.min(settings.value.wordCount, allWords.length))
        
        // 初始化结果
        results.value = {
          correct: 0,
          total: practiceWords.value.length,
          score: 0
        }
        
        // 重置索引
        currentIndex.value = 0
        isFlipped.value = false
        selectedOption.value = -1
        showResult.value = false
        
        // 准备特定模式的数据
        if (currentMode.value === 'quiz' || currentMode.value === 'listening') {
          prepareOptions()
        }
        
        // 进入练习模式
        currentStep.value = currentMode.value
        
      } catch (error) {
        console.error('开始练习失败:', error)
        ElMessage.error('准备练习内容失败')
      } finally {
        loading.value = false
      }
    }
    
    // 估算单词难度
    const estimateDifficulty = (word) => {
      // 根据复习次数和是否掌握来估算难度
      const reviewCount = word.reviewCount || 0
      if (word.mastered) return '简单'
      if (reviewCount >= 3) return '简单'
      if (reviewCount >= 1) return '中等'
      return '困难'
    }
    
    // 匹配难度级别
    const matchDifficultyLevel = (wordDifficulty, selectedDifficulty) => {
      // 如果选择的是简单，可以包含简单难度
      if (selectedDifficulty === '简单') return wordDifficulty === '简单'
      // 如果选择的是中等，可以包含简单和中等难度
      if (selectedDifficulty === '中等') return ['简单', '中等'].includes(wordDifficulty)
      // 如果选择的是困难，可以包含所有难度
      if (selectedDifficulty === '困难') return true
      return true
    }
    
    // 刷新页面（重置所有状态）
    const refreshPage = () => {
      // 重置所有状态
      currentStep.value = 'mode-selection'
      currentMode.value = ''
      currentIndex.value = 0
      practiceWords.value = []
      loading.value = false
      isFlipped.value = false
      selectedOption.value = -1
      showResult.value = false
      correctOptionIndex.value = -1
      
      // 重置设置
      settings.value = {
        wordCount: 10,
        difficulty: '全部',
        wordRange: 'today'
      }
      
      // 重置结果
      results.value = {
        correct: 0,
        total: 0,
        score: 0
      }
    }
    
    // 准备测验选项
    const prepareOptions = () => {
      try {
        const savedWords = localStorage.getItem('dailyEnglishWords')
        let allWords = []
        
        // 安全地解析localStorage数据
        try {
          allWords = savedWords ? JSON.parse(savedWords) : []
          if (!Array.isArray(allWords)) {
            console.warn('localStorage中的数据不是数组，已重置为空数组')
            allWords = []
          }
        } catch (e) {
          console.error('解析localStorage数据失败:', e)
          allWords = []
        }
        
        // 获取当前单词
        const word = currentWord.value
        if (!word || !word.word) {
          console.warn('当前没有可用的单词数据')
          return
        }
        
        if (currentMode.value === 'quiz') {
          // 测验模式：选项是单词的释义
          const options = []
          
          // 确保添加正确答案到选项中
          if (word.meaning) {
            options.push(String(word.meaning))
          }
          
          // 过滤出其他单词作为干扰项
          const otherWords = allWords.filter(w => 
            w && 
            w.id !== word.id && 
            w.meaning && 
            String(w.meaning) !== String(word.meaning)
          )
          
          // 随机排序
          const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random())
          
          // 添加干扰项，确保有3个干扰项
          for (let i = 0; i < Math.min(3, shuffledOthers.length); i++) {
            options.push(String(shuffledOthers[i].meaning))
          }
          
          // 如果干扰项不足，创建一些模拟选项
          while (options.length < 4) {
            options.push(`模拟选项 ${options.length + 1}`)
          }
          
          // 打乱选项顺序并保存
          quizOptions.value = options.sort(() => 0.5 - Math.random())
        } else if (currentMode.value === 'listening') {
          // 听力模式：选项是单词
          const options = []
          
          // 确保添加正确答案到选项中
          if (word.word) {
            options.push(String(word.word))
          }
          
          // 过滤出其他单词作为干扰项
          const otherWords = allWords.filter(w => 
            w && 
            w.id !== word.id && 
            w.word && 
            String(w.word) !== String(word.word)
          )
          
          // 随机排序
          const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random())
          
          // 添加干扰项，确保有3个干扰项
          for (let i = 0; i < Math.min(3, shuffledOthers.length); i++) {
            options.push(String(shuffledOthers[i].word))
          }
          
          // 如果干扰项不足，创建一些模拟选项
          while (options.length < 4) {
            options.push(`word${options.length + 1}`)
          }
          
          // 打乱选项顺序并保存
          listeningOptions.value = options.sort(() => 0.5 - Math.random())
          
          // 安全地计算正确选项的索引
          const correctWord = String(word.word)
          correctOptionIndex.value = listeningOptions.value.findIndex(opt => String(opt) === correctWord)
        }
      } catch (error) {
        console.error('准备选项时出错:', error)
        // 出错时提供默认选项，确保用户体验不会中断
        if (currentMode.value === 'quiz') {
          const word = currentWord.value
          // 确保包含正确答案
          const defaultOptions = word?.meaning ? [word.meaning, '选项2', '选项3', '选项4'] : ['选项1', '选项2', '选项3', '选项4']
          quizOptions.value = defaultOptions.sort(() => 0.5 - Math.random())
        } else if (currentMode.value === 'listening') {
          const word = currentWord.value
          // 确保包含正确答案
          const defaultOptions = word?.word ? [word.word, '单词2', '单词3', '单词4'] : ['单词1', '单词2', '单词3', '单词4']
          listeningOptions.value = defaultOptions.sort(() => 0.5 - Math.random())
          // 找出正确选项索引
          correctOptionIndex.value = listeningOptions.value.findIndex(opt => opt === word?.word)
        }
      }
    }
    
    // 播放发音
    const playSound = (word) => {
      try {
        const speech = new SpeechSynthesisUtterance(word)
        speech.lang = 'en-US'
        window.speechSynthesis.speak(speech)
      } catch (error) {
        console.error('播放发音失败:', error)
        ElMessage.warning('无法播放发音，请检查浏览器权限')
      }
    }
    
    // 闪卡模式：翻转卡片
    const flipCard = () => {
      isFlipped.value = !isFlipped.value
    }
    
    // 闪卡模式：上一个单词
    const prevWord = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
        isFlipped.value = false
      }
    }
    
    // 闪卡模式：下一个单词
    const nextWord = () => {
      if (currentIndex.value < practiceWords.value.length - 1) {
        currentIndex.value++
        isFlipped.value = false
      } else {
        // 完成练习
        calculateResults()
        currentStep.value = 'result'
      }
    }
    
    // 测验模式：选择选项
    const selectOption = (index) => {
      if (!showResult.value) {
        selectedOption.value = index
      }
    }
    
    // 测验模式：提交答案
    const submitQuiz = () => {
      if (selectedOption.value === -1) return
      
      showResult.value = true
      
      // 检查答案是否正确
      if (currentMode.value === 'quiz') {
        // 获取当前单词数据和选项
        const word = currentWord.value
        const options = quizOptions.value
        const selectionIndex = selectedOption.value
        
        // 增强的空值检查
        if (word && typeof word === 'object' && word.meaning && options && Array.isArray(options) && selectionIndex >= 0 && selectionIndex < options.length) {
          // 直接比较原始字符串，添加trim()处理以确保一致性
          const selectedOptionText = String(options[selectionIndex]).trim()
          const correctAnswerText = String(word.meaning).trim()
          
          // 进行精确比较
          if (selectedOptionText === correctAnswerText) {
            results.value.correct++
          } else {
            // 尝试更宽松的比较 - 去除所有空格并转小写
            const normalizeString = (str) => str.replace(/\s+/g, '').toLowerCase()
            const selectedNormalized = normalizeString(selectedOptionText)
            const correctNormalized = normalizeString(correctAnswerText)
            
            // 如果宽松比较正确，增加正确计数
            if (selectedNormalized === correctNormalized) {
              results.value.correct++
            }
          }
        }
      } else if (currentMode.value === 'listening') {
        if (selectedOption.value !== undefined && 
            correctOptionIndex.value !== undefined &&
            selectedOption.value === correctOptionIndex.value) {
          results.value.correct++
        }
      }
    }
    
    // 测验模式：下一题
    const nextQuiz = () => {
      if (currentIndex.value < practiceWords.value.length - 1) {
        currentIndex.value++
        selectedOption.value = -1
        showResult.value = false
        
        // 准备下一题的选项
        prepareOptions()
      } else {
        // 完成练习
        calculateResults()
        currentStep.value = 'result'
      }
    }
    
    // 计算结果
    const calculateResults = () => {
      results.value.score = practiceWords.value.length > 0 
        ? Math.round((results.value.correct / results.value.total) * 100) 
        : 0
    }
    
    // 重新练习
    const restartPractice = () => {
      currentStep.value = 'settings'
    }
    
    // 返回模式选择
    const backToModeSelection = () => {
      currentStep.value = 'mode-selection'
      currentMode.value = ''
      currentIndex.value = 0
      practiceWords.value = []
      isFlipped.value = false
      selectedOption.value = -1
      showResult.value = false
    }
    
    // 计算是否正确（用于测验模式）
    const isCorrect = computed(() => {
      if (!showResult.value || selectedOption.value === -1) return false
      
      if (currentMode.value === 'quiz') {
        const word = currentWord.value
        const options = quizOptions.value
        const selectionIndex = selectedOption.value
        
        if (word && typeof word === 'object' && word.meaning && options && Array.isArray(options) && selectionIndex >= 0 && selectionIndex < options.length) {
          // 规范化比较函数
          const normalizeString = (str) => str.replace(/\s+/g, '').toLowerCase()
          
          // 获取选择的选项和正确答案
          const selectedOptionText = String(options[selectionIndex]).trim()
          const correctAnswerText = String(word.meaning).trim()
          
          // 先尝试精确匹配
          if (selectedOptionText === correctAnswerText) {
            return true
          }
          
          // 再尝试宽松匹配
          const selectedNormalized = normalizeString(selectedOptionText)
          const correctNormalized = normalizeString(correctAnswerText)
          
          return selectedNormalized === correctNormalized
        }
      } else if (currentMode.value === 'listening') {
        return selectedOption.value !== undefined && 
               correctOptionIndex.value !== undefined && 
               selectedOption.value === correctOptionIndex.value
      }
      
      return false
    })
    
    // 返回上一步
    const goBack = () => {
      if (currentStep.value === 'settings') {
        backToModeSelection();
      } else if (currentStep.value === 'flashcard' || currentStep.value === 'quiz' || currentStep.value === 'listening') {
        currentStep.value = 'settings';
      }
    };

    return {
      currentStep,
      currentMode,
      currentIndex,
      practiceWords,
      loading,
      isFlipped,
      quizOptions,
      listeningOptions,
      selectedOption,
      showResult,
      correctOptionIndex,
      settings,
      results,
      currentWord,
      progressPercentage,
      isCorrect,
      selectMode,
      startPractice,
      playSound,
      flipCard,
      prevWord,
      nextWord,
      selectOption,
      submitQuiz,
      nextQuiz,
      restartPractice,
      backToModeSelection,
      goBack,
      refreshPage
    }
  }
}
</script>

<style scoped>
.practice-words {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.practice-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
}

h2 {
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

/* 模式选择 */
.mode-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.mode-card {
  background: #fff;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.mode-card i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #4285f4;
}

.mode-card h3 {
  margin-bottom: 10px;
  color: #333;
}

.mode-card p {
  color: #666;
  font-size: 14px;
}

/* 设置样式 */
.practice-settings {
  background: #fff;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.settings-group {
  margin-bottom: 25px;
}

.settings-group label {
  display: block;
  margin-bottom: 10px;
  color: #333;
  font-weight: 500;
}

.settings-group input[type="number"],
.settings-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.settings-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.back-btn,
.start-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-btn {
  background: #f5f5f5;
  color: #333;
}

.back-btn:hover {
  background: #e0e0e0;
}

.start-btn {
  background: #4285f4;
  color: white;
}

.start-btn:hover:not(:disabled) {
  background: #3367d6;
}

.start-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 进度条 */
.progress-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 15px;
}

.progress-fill {
  height: 100%;
  background: #4285f4;
  transition: width 0.3s ease;
}

/* 闪卡模式 */
.flashcard-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.flashcard-container {
  perspective: 1000px;
  width: 100%;
  max-width: 500px;
}

.flashcard {
  width: 100%;
  height: 300px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  cursor: pointer;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-back {
  transform: rotateY(180deg);
}

.card-front h3 {
  font-size: 36px;
  color: #333;
  margin-bottom: 10px;
}

.card-front p {
  color: #666;
  font-size: 18px;
}

.card-back h4 {
  color: #4285f4;
  margin-bottom: 15px;
  font-size: 20px;
}

.card-back .definition {
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.card-back .phonetic {
  margin-bottom: 15px;
  color: #666;
}

.card-back .example {
  font-style: italic;
  color: #666;
  text-align: center;
}

.flashcard-actions {
  display: flex;
  gap: 20px;
}

.audio-btn,
.flip-hint-btn {
  padding: 10px 20px;
  border: 1px solid #4285f4;
  background: white;
  color: #4285f4;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.audio-btn:hover,
.flip-hint-btn:hover {
  background: #4285f4;
  color: white;
}

.navigation-buttons {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.nav-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  background: #4285f4;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  background: #3367d6;
}

.nav-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

/* 测验模式 */
.quiz-mode {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.quiz-question {
  margin-bottom: 30px;
  text-align: center;
}

.quiz-question h3 {
  color: #333;
  font-size: 20px;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.quiz-option {
  padding: 15px 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quiz-option:hover {
  background: #f5f5f5;
}

.quiz-option.selected {
  border-color: #4285f4;
  background: #e8f0fe;
}

.quiz-option.correct {
  border-color: #34a853;
  background: #e6f4ea;
  font-weight: bold;
}

.quiz-option.incorrect {
  border-color: #ea4335;
  background: #fce8e6;
}

/* 无论是否选中，都显示正确答案 */
.quiz-option.correct-answer {
  border-color: #34a853;
  background: #e6f4ea;
}

/* 如果选中的是正确答案，使用正确样式 */
.quiz-option.correct.correct-answer {
  border-color: #34a853;
  background: #e6f4ea;
  font-weight: bold;
}

.quiz-result {
  text-align: center;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 30px;
}

.correct-result {
  background: #e6f4ea;
  color: #34a853;
}

.wrong-result {
  background: #fce8e6;
  color: #ea4335;
}

.quiz-actions {
  display: flex;
  justify-content: center;
}

.submit-btn,
.next-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn {
  background: #4285f4;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #3367d6;
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.next-btn {
  background: #34a853;
  color: white;
}

.next-btn:hover {
  background: #2d8d48;
}

/* 听力模式 */
.listening-mode {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.listening-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.play-audio-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  background: #4285f4;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.play-audio-btn:hover {
  background: #3367d6;
}

.listen-hint {
  font-size: 18px;
  color: #333;
}

.options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  width: 100%;
}

.option-btn {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.option-btn:hover {
  background: #f5f5f5;
}

.option-btn.selected {
  border-color: #4285f4;
  background: #e8f0fe;
}

.option-btn.correct {
  border-color: #34a853;
  background: #e6f4ea;
}

.option-btn.incorrect {
  border-color: #ea4335;
  background: #fce8e6;
}

.next-quiz-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  background: #34a853;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.next-quiz-btn:hover {
  background: #2d8d48;
}

/* 练习结果 */
.practice-result {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.result-card {
  background: white;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.result-header h3 {
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #4285f4;
  margin-bottom: 10px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.result-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-btn:nth-child(1) {
  background: #f5f5f5;
  color: #333;
}

.result-btn:nth-child(1):hover {
  background: #e0e0e0;
}

.result-btn:nth-child(2) {
  background: #4285f4;
  color: white;
}

.result-btn:nth-child(2):hover {
  background: #3367d6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .practice-words {
    padding: 15px;
  }
  
  .mode-cards {
    grid-template-columns: 1fr;
  }
  
  .settings-actions {
    flex-direction: column;
  }
  
  .flashcard {
    height: 250px;
  }
  
  .card-front h3 {
    font-size: 28px;
  }
  
  .card-back .definition {
    font-size: 20px;
  }
  
  .flashcard-actions,
  .navigation-buttons,
  .result-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .options {
    grid-template-columns: 1fr;
  }
}
</style>