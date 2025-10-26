<template>
  <div class="search-words-container">
    <!-- 背景装饰元素 -->
    <div class="background-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-gradient"></div>
    </div>
    
    <!-- 主卡片 - 使用渐变背景 -->
    <el-card class="search-card gradient-card" :class="{ 'card-loaded': !searching }">
      <template #header>
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-search"></i>
          </div>
          <h2 class="gradient-text">搜索单词</h2>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="search-inline-form">
          <el-form-item>
            <el-input
              v-model="searchForm.keyword"
              placeholder="输入单词或中文意思搜索"
              class="search-input"
              clearable
              @input="handleSearch"
              @keyup.enter="handleSearch"
              prefix-icon="Search"
            ></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-select
              v-model="searchForm.filter"
              placeholder="筛选条件"
              class="search-filter"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="all"></el-option>
              <el-option label="仅单词" value="word"></el-option>
              <el-option label="仅释义" value="meaning"></el-option>
              <el-option label="标签" value="tag"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-select
              v-model="searchForm.sort"
              placeholder="排序方式"
              class="search-sort"
              @change="handleSearch"
            >
              <el-option label="默认" value="default"></el-option>
              <el-option label="按添加日期" value="date"></el-option>
              <el-option label="按字母顺序" value="alphabet"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              @click="handleSearch"
              class="search-btn"
              :loading="searching"
            >
              <i class="fas fa-search"></i>
              搜索
            </el-button>
            <el-button
              @click="clearSearch"
              class="clear-btn"
              :disabled="!hasSearch"
            >
              <i class="fas fa-redo"></i>
              清空
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 高级筛选 -->
        <div class="advanced-filter" v-if="showAdvancedFilter">
          <el-divider content-position="left">高级筛选</el-divider>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="词性">
                <el-select
                  v-model="advancedFilters.partOfSpeech"
                  placeholder="选择词性"
                  class="form-select"
                  clearable
                  @change="handleSearch"
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
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="日期范围">
                <el-date-picker
                  v-model="advancedFilters.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  class="date-range-picker"
                  @change="handleSearch"
                ></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="常用标签">
            <div class="tag-selector">
              <el-tag
                v-for="tag in popularTags"
                :key="tag"
                :type="advancedFilters.selectedTags.includes(tag) ? 'primary' : 'info'"
                :effect="advancedFilters.selectedTags.includes(tag) ? 'dark' : 'plain'"
                class="filter-tag"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-form-item>
        </div>
        
        <div class="filter-toggle">
          <el-button
            type="text"
            @click="toggleAdvancedFilter"
            class="toggle-btn"
          >
            <i :class="showAdvancedFilter ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            {{ showAdvancedFilter ? '收起高级筛选' : '展开高级筛选' }}
          </el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 搜索结果 -->
    <div class="search-results">
      <div class="results-header">
        <h3><i class="fas fa-list"></i> 搜索结果</h3>
        <div class="results-stats" v-if="hasSearch">
          共找到 <span class="highlight">{{ filteredWords.length }}</span> 个单词
          <el-popover
            placement="top"
            title="搜索提示"
            :width="200"
            trigger="hover"
            content="点击单词可查看详情，按Esc键清空搜索"
          >
            <el-button type="text" class="info-btn"><i class="fas fa-info-circle"></i></el-button>
          </el-popover>
        </div>
      </div>
      
      <!-- 搜索状态显示 -->
      <div v-if="searching" class="searching-state">
        <el-skeleton :rows="4" animated />
      </div>
      
      <!-- 空结果显示 -->
      <div v-else-if="hasSearch && filteredWords.length === 0" class="empty-results">
        <div class="empty-icon">
          <i class="fas fa-search-minus"></i>
        </div>
        <h4>未找到匹配的单词</h4>
        <p>尝试调整搜索条件或检查拼写</p>
        <el-button type="primary" @click="clearSearch">
          <i class="fas fa-redo"></i>
          重置搜索
        </el-button>
      </div>
      
      <!-- 结果列表 -->
      <el-card
        v-for="(word, index) in displayWords"
        :key="word.id"
        class="word-card"
        :class="{ 'highlight-card': isSelectedWord(word.id) }"
      >
        <div class="word-card-header">
          <div class="word-info">
            <h3 class="word-title" @click="toggleWordDetail(word.id)">
              <i class="fas fa-book"></i>
              {{ word.word }}
              <span v-if="word.phonetic" class="phonetic">[{{ word.phonetic }}]</span>
              <el-button
                type="primary"
                size="small"
                circle
                @click.stop="pronounceWord(word.word)"
                class="pronounce-btn"
                :title="'发音: ' + word.word"
              >
                <i class="fas fa-volume-up"></i>
              </el-button>
            </h3>
            <div class="word-meta">
              <span v-if="word.partOfSpeech" class="part-of-speech">{{ word.partOfSpeech }}</span>
              <span class="date">{{ formatDate(word.date) }}</span>
              <div class="tags">
                <el-tag
                  v-for="tag in word.tags"
                  :key="tag"
                  effect="plain"
                  size="small"
                  class="word-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
          <el-button
            type="danger"
            size="small"
            circle
            @click="confirmDelete(word)"
            class="delete-btn"
            title="删除单词"
          >
            <i class="fas fa-trash-alt"></i>
          </el-button>
        </div>
        
        <div class="word-meaning">
          <p>{{ word.meaning }}</p>
        </div>
        
        <!-- 单词详情 -->
        <transition name="detail-fade">
          <div v-if="expandedWords.includes(word.id)" class="word-details">
            <div v-if="word.example" class="example-section">
              <h4><i class="fas fa-quote-right"></i> 例句</h4>
              <p class="example-text">{{ word.example }}</p>
            </div>
            
            <div v-if="word.synonyms" class="synonyms-section">
              <h4><i class="fas fa-exchange-alt"></i> 同义词/反义词</h4>
              <p>{{ word.synonyms }}</p>
            </div>
          </div>
        </transition>
        
        <div class="word-actions">
          <el-button
            type="text"
            @click="toggleWordDetail(word.id)"
            class="detail-toggle"
          >
            <i :class="expandedWords.includes(word.id) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            {{ expandedWords.includes(word.id) ? '收起详情' : '查看详情' }}
          </el-button>
        </div>
      </el-card>
      
      <!-- 分页 -->
      <div v-if="hasSearch && filteredWords.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredWords.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="30%"
      class="delete-dialog"
    >
      <div class="delete-confirm-content">
        <div class="delete-icon"><i class="fas fa-exclamation-triangle"></i></div>
        <p>确定要删除单词 <strong>{{ currentWordToDelete?.word }}</strong> 吗？</p>
        <p class="delete-warning">此操作不可撤销</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteWord" :loading="deleting">确定删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'SearchWords',
  emits: ['words-updated'],
  setup(props, { emit }) {
    // 搜索相关状态
    const searchForm = reactive({
      keyword: '',
      filter: 'all',
      sort: 'default'
    })
    
    const advancedFilters = reactive({
      partOfSpeech: '',
      dateRange: [],
      selectedTags: []
    })
    
    const showAdvancedFilter = ref(false)
    const searching = ref(false)
    const hasSearch = ref(false)
    const words = ref([])
    const filteredWords = ref([])
    const expandedWords = ref([])
    const selectedWordId = ref(null)
    
    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)
    
    // 删除相关
    const deleteDialogVisible = ref(false)
    const currentWordToDelete = ref(null)
    const deleting = ref(false)
    
    // 计算属性
    const displayWords = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredWords.value.slice(start, end)
    })
    
    // 计算热门标签
    const popularTags = computed(() => {
      const tagCounts = {}
      words.value.forEach(word => {
        if (word.tags && word.tags.length) {
          word.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        }
      })
      
      // 排序并返回前10个最常用的标签
      return Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag)
    })
    
    // 加载单词数据
    const loadWords = () => {
      const savedWords = localStorage.getItem('dailyEnglishWords')
      words.value = savedWords ? JSON.parse(savedWords) : []
    }
    
    // 处理搜索
    const handleSearch = async () => {
      searching.value = true
      
      // 模拟异步搜索
      await new Promise(resolve => setTimeout(resolve, 300))
      
      let results = [...words.value]
      const keyword = searchForm.keyword.toLowerCase().trim()
      
      // 关键词搜索
      if (keyword) {
        if (searchForm.filter === 'all') {
          results = results.filter(word => 
            word.word.toLowerCase().includes(keyword) ||
            word.meaning.toLowerCase().includes(keyword) ||
            (word.tags && word.tags.some(tag => tag.toLowerCase().includes(keyword)))
          )
        } else if (searchForm.filter === 'word') {
          results = results.filter(word => word.word.toLowerCase().includes(keyword))
        } else if (searchForm.filter === 'meaning') {
          results = results.filter(word => word.meaning.toLowerCase().includes(keyword))
        } else if (searchForm.filter === 'tag') {
          results = results.filter(word => 
            word.tags && word.tags.some(tag => tag.toLowerCase().includes(keyword))
          )
        }
      }
      
      // 高级筛选
      if (advancedFilters.partOfSpeech) {
        results = results.filter(word => word.partOfSpeech === advancedFilters.partOfSpeech)
      }
      
      if (advancedFilters.dateRange && advancedFilters.dateRange.length === 2) {
        const [startDate, endDate] = advancedFilters.dateRange
        results = results.filter(word => 
          word.date >= startDate && word.date <= endDate
        )
      }
      
      if (advancedFilters.selectedTags.length > 0) {
        results = results.filter(word => 
          word.tags && advancedFilters.selectedTags.some(tag => word.tags.includes(tag))
        )
      }
      
      // 排序
      if (searchForm.sort === 'date') {
        results.sort((a, b) => new Date(b.date) - new Date(a.date))
      } else if (searchForm.sort === 'alphabet') {
        results.sort((a, b) => a.word.localeCompare(b.word))
      }
      
      filteredWords.value = results
      hasSearch.value = true
      currentPage.value = 1 // 重置到第一页
      searching.value = false
    }
    
    // 清空搜索
    const clearSearch = () => {
      searchForm.keyword = ''
      searchForm.filter = 'all'
      searchForm.sort = 'default'
      
      advancedFilters.partOfSpeech = ''
      advancedFilters.dateRange = []
      advancedFilters.selectedTags = []
      
      filteredWords.value = []
      hasSearch.value = false
      currentPage.value = 1
      expandedWords.value = []
    }
    
    // 切换高级筛选
    const toggleAdvancedFilter = () => {
      showAdvancedFilter.value = !showAdvancedFilter.value
    }
    
    // 切换标签选择
    const toggleTag = (tag) => {
      const index = advancedFilters.selectedTags.indexOf(tag)
      if (index > -1) {
        advancedFilters.selectedTags.splice(index, 1)
      } else {
        advancedFilters.selectedTags.push(tag)
      }
    }
    
    // 切换单词详情
    const toggleWordDetail = (wordId) => {
      const index = expandedWords.value.indexOf(wordId)
      if (index > -1) {
        expandedWords.value.splice(index, 1)
      } else {
        expandedWords.value.push(wordId)
      }
      selectedWordId.value = wordId
    }
    
    // 检查单词是否被选中
    const isSelectedWord = (wordId) => {
      return selectedWordId.value === wordId
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
    
    // 单词发音
    const pronounceWord = (word) => {
      if (!word) return
      
      try {
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = 'en-US'
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('发音失败:', error)
        ElMessage.error('发音功能暂不可用')
      }
    }
    
    // 确认删除
    const confirmDelete = (word) => {
      currentWordToDelete.value = word
      deleteDialogVisible.value = true
    }
    
    // 删除单词
    const deleteWord = async () => {
      if (!currentWordToDelete.value) return
      
      deleting.value = true
      
      try {
        // 模拟异步删除
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 从数据中删除
        const index = words.value.findIndex(w => w.id === currentWordToDelete.value.id)
        if (index > -1) {
          words.value.splice(index, 1)
          localStorage.setItem('dailyEnglishWords', JSON.stringify(words.value))
          
          // 从筛选结果中也删除
          const filteredIndex = filteredWords.value.findIndex(w => w.id === currentWordToDelete.value.id)
          if (filteredIndex > -1) {
            filteredWords.value.splice(filteredIndex, 1)
          }
          
          // 从展开列表中移除
          const expandedIndex = expandedWords.value.indexOf(currentWordToDelete.value.id)
          if (expandedIndex > -1) {
            expandedWords.value.splice(expandedIndex, 1)
          }
          
          ElMessage.success('单词删除成功！')
          
          // 通知其他组件
          emit('words-updated')
          const event = new CustomEvent('wordUpdated', { detail: null })
          window.dispatchEvent(event)
        }
      } catch (error) {
        console.error('删除单词失败:', error)
        ElMessage.error('删除失败，请重试')
      } finally {
        deleting.value = false
        deleteDialogVisible.value = false
        currentWordToDelete.value = null
      }
    }
    
    // 分页处理
    const handleSizeChange = (size) => {
      pageSize.value = size
    }
    
    const handleCurrentChange = (current) => {
      currentPage.value = current
    }
    
    // 监听键盘事件
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        clearSearch()
      }
    }
    
    // 监听单词数据变化
    const handleWordUpdated = () => {
      loadWords()
      if (hasSearch.value) {
        handleSearch()
      }
    }
    
    // 组件挂载时
    onMounted(() => {
      loadWords()
      window.addEventListener('keydown', handleKeydown)
      window.addEventListener('wordUpdated', handleWordUpdated)
    })
    
    // 组件卸载时清理事件监听
    const onUnmounted = () => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('wordUpdated', handleWordUpdated)
    }
    
    return {
      searchForm,
      advancedFilters,
      showAdvancedFilter,
      searching,
      hasSearch,
      words,
      filteredWords,
      displayWords,
      popularTags,
      expandedWords,
      currentPage,
      pageSize,
      deleteDialogVisible,
      currentWordToDelete,
      deleting,
      handleSearch,
      clearSearch,
      toggleAdvancedFilter,
      toggleTag,
      toggleWordDetail,
      isSelectedWord,
      formatDate,
      pronounceWord,
      confirmDelete,
      deleteWord,
      handleSizeChange,
      handleCurrentChange
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

.search-words-container {
  padding: var(--space-xl);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-xl);
  animation: fadeIn 0.5s var(--ease-out);
}

/* 搜索卡片样式 */
.search-card {
  border-radius: var(--radius-xl);
  background: var(--background-card);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal) ease;
  overflow: hidden;
  border: none;
}

.search-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.search-card .card-header {
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  background: var(--gradient-light);
  border-bottom: 1px solid var(--border-color-light);
}

.search-card .card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-card .card-header h2 i {
  font-size: 1.2rem;
  color: var(--primary-color);
  animation: pulse 2s infinite;
}

/* 搜索表单样式 */
.search-form {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-normal) ease, box-shadow var(--transition-normal) ease;
}

.search-form:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.search-inline-form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: end;
  margin-bottom: var(--space-lg);
}

.search-input {
  min-width: 250px;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal) ease;
}

.search-input:focus {
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  border-color: var(--primary-color);
}

.search-filter,
.search-sort {
  min-width: 150px;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal) ease;
}

.search-filter:focus,
.search-sort:focus {
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  border-color: var(--primary-color);
}

.search-btn,
.clear-btn {
  border-radius: var(--radius-full);
  transition: all var(--transition-normal) ease;
  min-width: 100px;
}

.search-btn {
  background: var(--gradient-primary);
  border: none;
  color: white;
  transition: all var(--transition-normal) var(--ease-bounce);
  box-shadow: var(--shadow-sm);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  filter: brightness(1.1);
}

.clear-btn {
  background: rgba(255, 255, 255, 0.8);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-md);
}

.clear-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* 高级筛选样式 */
.advanced-filter {
  background: rgba(255, 255, 255, 0.85);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-md);
  border: 1px solid var(--border-color-light);
  animation: slideDown 0.3s var(--ease-out);
}

.form-select,
.date-range-picker {
  width: 100%;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal) ease;
}

.form-select:focus,
.date-range-picker:focus {
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  border-color: var(--primary-color);
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.filter-tag {
  cursor: pointer;
  transition: all var(--transition-fast) ease;
  border-radius: var(--radius-full);
}

.filter-tag:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.filter-toggle {
  display: flex;
  justify-content: center;
}

.toggle-btn {
  color: var(--primary-color);
  transition: all var(--transition-fast) ease;
}

.toggle-btn:hover {
  transform: scale(1.05);
}

/* 搜索结果样式 */
.search-results {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-lg);
  position: relative;
  animation: fadeIn 0.6s var(--ease-out);
}

/* 卡片标题样式 */
.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  backdrop-filter: blur(10px);
  transition: transform var(--transition-normal) var(--ease-bounce);
}

.search-card:hover .header-icon {
  transform: scale(1.05) rotate(5deg);
}

.gradient-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
  margin: 0;
  position: relative;
}

.gradient-card {
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-lg);
  transition: transform var(--transition-normal) var(--ease-bounce),
              box-shadow var(--transition-normal) ease;
  animation: fadeInUp 0.6s var(--ease-out);
}

.gradient-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%);
  pointer-events: none;
}

.gradient-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl);
}

.card-loaded {
  animation: none;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-md);
  border-bottom: 2px solid var(--primary-light);
}

.results-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-header h3 i {
  color: var(--primary-color);
}

.results-stats {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.results-stats .highlight {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 1.1rem;
}

.info-btn {
  margin-left: var(--space-sm);
}

/* 搜索状态样式 */
.searching-state {
  padding: var(--space-lg);
  background: var(--background-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

/* 空结果样式 */
.empty-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  animation: fadeIn 0.5s var(--ease-out);
  backdrop-filter: blur(5px);
}

.empty-icon {
  font-size: 3.5rem;
  color: var(--text-tertiary);
  margin-bottom: var(--space-lg);
  animation: float 3s ease-in-out infinite;
  opacity: 0.7;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-results h4 {
  margin: 0 0 var(--space-md);
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
}

.empty-results p {
  margin: 0 0 var(--space-lg);
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 单词卡片样式 */
.word-card {
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal) var(--ease-bounce);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
  animation: fadeInUp 0.4s var(--ease-out);
  position: relative;
  backdrop-filter: blur(5px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.word-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.word-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--gradient-primary);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--transition-normal) ease;
}

.word-card:hover::before {
  transform: scaleY(1);
}

.word-card.highlight-card {
  border: 2px solid var(--primary-light);
  box-shadow: 0 0 20px rgba(67, 97, 238, 0.1);
}

.word-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-md);
}

.word-info {
  flex: 1;
}

.word-title {
  margin: 0 0 var(--space-sm);
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all var(--transition-fast) ease;
}

.word-title:hover {
  color: var(--secondary-color);
}

.word-title i {
  color: var(--secondary-color);
}

.phonetic {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: italic;
  margin-left: var(--space-sm);
}

.pronounce-btn {
  background: var(--gradient-success);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal) ease;
}

.pronounce-btn:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.word-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.part-of-speech {
  font-size: 0.8rem;
  padding: 2px 8px;
  background: var(--background-tag);
  border-radius: var(--radius-full);
  color: var(--primary-color);
  font-weight: 500;
}

.date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.word-tag {
  font-size: 0.75rem;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast) ease;
}

.word-meaning {
  padding: var(--space-md);
  background: var(--gradient-light);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
}

/* 单词详情样式 */
.word-details {
  padding: var(--space-md) 0;
  border-top: 1px solid var(--border-color-light);
}

.example-section,
.synonyms-section {
  margin-bottom: var(--space-md);
}

.example-section h4,
.synonyms-section h4 {
  margin: 0 0 var(--space-sm);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.example-section h4 i,
.synonyms-section h4 i {
  color: var(--primary-color);
  font-size: 0.9rem;
}

.example-text {
  font-style: italic;
  color: var(--text-secondary);
  line-height: 1.6;
  padding-left: var(--space-md);
  border-left: 3px solid var(--primary-light);
}

.word-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-md);
}

.detail-toggle {
  color: var(--primary-color);
  transition: all var(--transition-fast) ease;
}

.detail-toggle:hover {
  transform: scale(1.05);
}

.delete-btn {
  color: white;
  transition: all var(--transition-fast) ease;
}

.delete-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(247, 37, 133, 0.3);
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: var(--space-lg);
}

/* 删除对话框样式 */
.delete-dialog .el-dialog__header {
  background: var(--gradient-light);
  border-bottom: 1px solid var(--border-color-light);
  padding: var(--space-lg);
}

.delete-dialog .el-dialog__title {
  color: var(--danger-color);
  font-size: 1.2rem;
  font-weight: 600;
}

.delete-confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-lg) 0;
}

.delete-icon {
  font-size: 3rem;
  color: var(--warning-color);
  margin-bottom: var(--space-lg);
  animation: pulse 1.5s infinite;
}

.delete-confirm-content p {
  margin: 0 0 var(--space-md);
  color: var(--text-secondary);
}

.delete-confirm-content p strong {
  color: var(--danger-color);
}

.delete-warning {
  color: var(--danger-color) !important;
  font-size: 0.9rem;
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

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 500px;
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

/* 过渡动画 */
.detail-fade-enter-active,
.detail-fade-leave-active {
  transition: all var(--transition-normal) ease;
  overflow: hidden;
}

.detail-fade-enter-from,
.detail-fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.detail-fade-enter-to,
.detail-fade-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .search-inline-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input,
  .search-filter,
  .search-sort {
    width: 100%;
    min-width: auto;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
}

@media (max-width: 768px) {
  .search-words-container {
    padding: var(--space-md);
    gap: var(--space-lg);
  }
  
  .search-card .card-header h2 {
    font-size: 1.3rem;
  }
  
  .search-form {
    padding: var(--space-md);
  }
  
  .advanced-filter {
    padding: var(--space-md);
  }
  
  .word-card-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .delete-btn {
    align-self: flex-end;
  }
  
  .word-title {
    font-size: 1.2rem;
  }
  
  .delete-dialog {
    width: 80% !important;
  }
}

@media (max-width: 480px) {
  .search-words-container {
    padding: var(--space-sm);
  }
  
  .search-form {
    padding: var(--space-sm);
  }
  
  .advanced-filter {
    padding: var(--space-sm);
  }
  
  .word-meaning {
    padding: var(--space-sm);
  }
  
  .results-header h3 {
    font-size: 1.1rem;
  }
  
  .empty-icon {
    font-size: 2rem;
  }
  
  .delete-icon {
    font-size: 2rem;
  }
}

/* 滚动条样式 */
:deep(.el-select-dropdown__wrap) {
  max-height: 250px;
}

/* 输入框聚焦动画 */
.search-input,
.search-filter,
.search-sort {
  position: relative;
  overflow: hidden;
}

.search-input:focus::after,
.search-filter:focus::after,
.search-sort:focus::after {
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