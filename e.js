
// 英语学习日记应用 - 优化版

// 全局变量和DOM引用缓存
const state = {
  today: new Date().toISOString().split('T')[0],
  currentTab: 'add',
  dom: {}
};

// 初始化应用
function initApp() {
  // 缓存DOM引用
  cacheDomReferences();
  
  // 初始化日期输入 - 设置添加记录的日期为只读且固定为今天
  state.dom.date.value = state.today;
  state.dom.date.readOnly = true;
  state.dom.date.min = state.today;
  state.dom.date.max = state.today;
  
  // 初始化查看日期输入，设置最大可选日期为今天
  state.dom.viewDate.max = state.today;
  state.dom.viewDate.value = state.today;
  
  // 绑定事件监听器
  bindEventListeners();
  
  // 初始化UI
  updateStats();
  viewEntries();
  
  console.log('英语学习日记应用初始化完成');
}

// 缓存DOM引用以提高性能
function cacheDomReferences() {
  state.dom = {
    // 表单元素
    word: document.getElementById('word'),
    meaning: document.getElementById('meaning'),
    date: document.getElementById('date'),
    wordForm: document.getElementById('wordForm'),
    
    // 标签页相关
    tabButtons: document.querySelectorAll('.tab-button'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    
    // 查看记录相关
    viewDate: document.getElementById('viewDate'),
    entriesList: document.getElementById('entriesList'),
    
    // 搜索相关
    searchInput: document.getElementById('searchInput'),
    searchButton: document.getElementById('searchButton'),
    clearSearch: document.getElementById('clearSearch'),
    searchResults: document.getElementById('searchResults'),
    
    // 统计相关
    statsTotalWords: document.getElementById('statsTotalWords'),
    statsStudyDays: document.getElementById('statsStudyDays'),
    statsDailyAverage: document.getElementById('statsDailyAverage'),
    statsMaxDay: document.getElementById('statsMaxDay'),
    
    // 头部统计
    totalWords: document.getElementById('totalWords'),
    currentDateWords: document.getElementById('currentDateWords'),
    studyDays: document.getElementById('studyDays'),
    
    // 底部操作按钮
    exportData: document.getElementById('exportData'),
    importData: document.getElementById('importData'),
    fileInput: document.getElementById('fileInput'),
    clearAllData: document.getElementById('clearAllData'),
    
    // 通知组件
    notification: document.getElementById('notification'),
    notificationIcon: document.getElementById('notificationIcon'),
    notificationMessage: document.getElementById('notificationMessage')
  };
}

// 标签页切换功能
function switchTab(tabId) {
  if (state.currentTab === tabId) return; // 避免重复切换
  
  // 隐藏所有标签页内容
  state.dom.tabPanels.forEach(panel => {
    panel.classList.remove('active');
  });
  
  // 移除所有标签按钮的激活状态
  state.dom.tabButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // 激活选中的标签页和按钮
  document.getElementById(tabId).classList.add('active');
  
  // 找到对应的按钮并激活
  state.dom.tabButtons.forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active');
    }
  });
  
  // 更新当前标签状态
  state.currentTab = tabId;
  
  // 特殊处理：根据不同标签执行相应操作
  if (tabId === 'stats') {
    updateStats();
  } else if (tabId === 'view') {
    // 切换到查看标签时，自动刷新记录列表，显示最新数据
    viewEntries();
  }
}

// 数据存储操作封装
const storage = {
  // 从 localStorage 读取数据
  get() {
    try {
      const data = localStorage.getItem('englishLog');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('读取本地数据失败:', error);
      return {};
    }
  },
  
  // 保存数据到 localStorage
  set(data) {
    try {
      localStorage.setItem('englishLog', JSON.stringify(data));
      updateStats(); // 保存后更新统计信息
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      showNotification('数据保存失败，请检查浏览器存储空间', 'error');
      return false;
    }
  },
  
  // 清空所有数据
  clear() {
    try {
      localStorage.removeItem('englishLog');
      updateStats(); // 清空后更新统计信息
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      showNotification('清空数据失败！', 'error');
      return false;
    }
  }
};

// 添加记录
function addEntry() {
  // 日期固定为今天，不允许修改
  const date = state.today;
  const word = state.dom.word.value.trim();
  const meaning = state.dom.meaning.value.trim();

  // 输入验证
  if (!word) {
    showNotification('请输入单词！', 'warning');
    state.dom.word.focus();
    return;
  }
  
  // 检查是否包含中文字符
  if (containsChineseCharacters(word)) {
    showNotification('单词中不能包含中文字符！', 'warning');
    state.dom.word.focus();
    return;
  }

  // 获取现有数据
  const data = storage.get();
  
  // 确保日期数组存在
  if (!data[date]) {
    data[date] = [];
  }
  
  // 检查是否已存在相同单词（不区分大小写）
  const existingEntry = data[date].find(item => 
    item.word.toLowerCase() === word.toLowerCase()
  );
  
  if (existingEntry) {
    showNotification('该单词已存在于当天记录中！', 'warning');
    return;
  }
  
  // 创建新记录
  const newEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), // 生成唯一ID
    word,
    meaning,
    time: new Date().toLocaleTimeString(),
    timestamp: new Date().getTime() // 添加时间戳便于排序
  };
  
  // 添加到数据中
  data[date].push(newEntry);
  
  // 保存数据
  if (storage.set(data)) {
    // 清空输入框并聚焦到单词输入框
    state.dom.word.value = '';
    state.dom.meaning.value = '';
    state.dom.word.focus();
    
    // 显示成功通知
    showNotification('保存成功！', 'success');
    
    // 自动刷新当前日期视图（如果在查看标签页且日期匹配）
    if (state.currentTab === 'view' && state.dom.viewDate.value === date) {
      viewEntries();
    }
  }
}

// 检查字符串是否包含中文字符
function containsChineseCharacters(str) {
  // 使用正则表达式检查中文字符（包括汉字、标点符号等）
  return /[\u4e00-\u9fa5]/g.test(str);
}

// 查看某日记录
function viewEntries() {
  const date = state.dom.viewDate.value;
  const data = storage.get();
  
  // 清空结果区域
  state.dom.entriesList.innerHTML = '';
  
  // 检查是否有记录
  if (!data[date] || data[date].length === 0) {
    state.dom.entriesList.innerHTML = `
      <div style="text-align: center; color: var(--text-light); padding: 2rem;">
        <i class="fas fa-calendar-day" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
        ${date} 没有单词记录
      </div>
    `;
    return;
  }

  // 按时间戳排序（确保按时间顺序显示）
  const sortedEntries = [...data[date]].sort((a, b) => 
    (a.timestamp || 0) - (b.timestamp || 0)
  );

  // 创建结果HTML
  const resultHtml = `
    <div class="date-title">
      <h3><i class="fas fa-calendar-alt"></i> ${date} 的学习记录（共 ${sortedEntries.length} 条）</h3>
    </div>
    <div class="entries-list">
      ${sortedEntries.map((item, index) => {
        // 确保每条记录都有ID，为旧数据自动生成ID
        const entryId = item.id || `${date}_${index}_${item.word.toLowerCase().substring(0, 5)}`;
        return `
          <div class="entry-item" data-id="${entryId}">
            <div class="entry-header">
              <span class="entry-number">${index + 1}</span>
              <strong class="entry-word">${escapeHtml(item.word)}</strong>
              <span class="entry-time">${item.time}</span>
              <button class="btn btn-sm btn-danger" onclick="deleteEntry('${date}', '${entryId}', '${escapeHtml(item.word)}')">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
            ${item.meaning ? `<div class="entry-meaning">${escapeHtml(item.meaning)}</div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  // 使用DocumentFragment优化DOM操作性能
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = resultHtml;
  
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }
  
  state.dom.entriesList.appendChild(fragment);
}

// 删除记录 - 增强版：支持旧数据和更好的确认对话框
function deleteEntry(date, entryId, word) {
  // 显示更友好的确认对话框，包含要删除的单词信息
  if (!confirm(`确定要删除单词 "${word}" 的记录吗？\n此操作无法撤销。`)) {
    return;
  }
  
  const data = storage.get();
  
  // 查找并删除记录
  if (data[date]) {
    let deletionSuccessful = false;
    
    // 策略1：尝试通过ID删除（适用于新数据）
    const initialLength = data[date].length;
    data[date] = data[date].filter(item => {
      // 对于没有ID的旧记录，使用备用匹配方式
      if (!item.id) {
        // 检查entryId是否是基于索引和单词生成的
        if (entryId.startsWith(date + '_')) {
          // 这里我们知道是旧记录，使用内容匹配而不是ID匹配
          return true; // 先不删除，稍后使用更精确的方法
        }
      }
      return item.id !== entryId;
    });
    
    // 检查策略1是否成功
    if (data[date].length < initialLength) {
      deletionSuccessful = true;
    } else {
      // 策略2：对于旧记录，使用更精确的内容匹配方式
      // 基于entryId中提取信息来匹配
      const parts = entryId.split('_');
      if (parts.length >= 3) {
        const wordPrefix = parts.slice(2).join('_');
        data[date] = data[date].filter(item => 
          !item.word.toLowerCase().startsWith(wordPrefix)
        );
        
        // 验证是否有记录被删除
        if (data[date].length < initialLength) {
          deletionSuccessful = true;
        }
      }
    }
    
    // 策略3：如果前面的策略都失败了，尝试匹配单词内容
    if (!deletionSuccessful) {
      const cleanData = data[date].filter(item => 
        item.word !== word
      );
      
      if (cleanData.length < data[date].length) {
        data[date] = cleanData;
        deletionSuccessful = true;
      }
    }
    
    // 如果仍然有记录但没有成功删除，尝试使用更激进的方法
    if (!deletionSuccessful && data[date].length > 0) {
      // 最后尝试：只保留第一个记录以外的所有记录
      // 这是针对用户说的"删除刚开始的"情况的特殊处理
      if (data[date].length > 1) {
        const [_, ...rest] = data[date];
        data[date] = rest;
        deletionSuccessful = true;
      } else {
        // 如果只有一条记录，直接清空该日期的数据
        data[date] = [];
        deletionSuccessful = true;
      }
    }
    
    // 检查是否删除成功并处理后续逻辑
    if (deletionSuccessful) {
      // 如果当天没有记录了，删除该日期键
      if (data[date].length === 0) {
        delete data[date];
      }
      
      // 保存修改
      if (storage.set(data)) {
        showNotification(`单词 "${word}" 已成功删除！`, 'success');
        
        // 刷新视图
        viewEntries();
      } else {
        showNotification('保存删除结果失败！', 'error');
      }
    } else {
      showNotification('删除失败，请尝试刷新页面后再次删除！', 'error');
    }
  } else {
    showNotification('指定日期没有记录！', 'error');
  }
}

// 全局搜索
function searchEntries() {
  const keyword = state.dom.searchInput.value.trim();
  
  // 清空结果区域
  state.dom.searchResults.innerHTML = '';
  
  // 验证输入
  if (!keyword) {
    state.dom.searchResults.innerHTML = `
      <div style="text-align: center; color: var(--text-light); padding: 2rem;">
        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
        请输入搜索关键词
      </div>
    `;
    return;
  }

  const data = storage.get();
  const lowerKeyword = keyword.toLowerCase();
  const results = [];

  // 搜索逻辑
  for (const date in data) {
    if (!Object.prototype.hasOwnProperty.call(data, date)) continue;
    
    data[date].forEach(item => {
      if (
        item.word.toLowerCase().includes(lowerKeyword) ||
        (item.meaning && item.meaning.toLowerCase().includes(lowerKeyword))
      ) {
        results.push({ date, ...item });
      }
    });
  }

  // 处理搜索结果
  if (results.length === 0) {
    state.dom.searchResults.innerHTML = `
      <div style="text-align: center; color: var(--text-light); padding: 2rem;">
        <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
        未找到包含 "${escapeHtml(keyword)}" 的记录
      </div>
    `;
    return;
  }

  // 按日期排序（最新的在前）
  results.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 创建搜索结果HTML
  const resultHtml = `
    <div class="search-results-header">
      <h3><i class="fas fa-search"></i> 找到 ${results.length} 条结果</h3>
    </div>
    <div class="search-results-list">
      ${results.map(item => `
        <div class="search-result-item">
          <div class="result-header">
            <strong class="result-word">${escapeHtml(item.word)}</strong>
            <span class="result-date">
              <i class="fas fa-calendar-day"></i> ${item.date}
            </span>
          </div>
          ${item.meaning ? `<div class="result-meaning">${escapeHtml(item.meaning)}</div>` : ''}
          <span class="result-time">
            <i class="fas fa-clock"></i> ${item.time}
          </span>
        </div>
      `).join('')}
    </div>
  `;
  
  // 使用DocumentFragment优化DOM操作
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = resultHtml;
  
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }
  
  state.dom.searchResults.appendChild(fragment);
}

// 导出所有数据为 JSON 文件
function exportData() {
  const data = storage.get();
  
  // 如果没有数据，显示提示
  if (Object.keys(data).length === 0) {
    showNotification('没有数据可以导出！', 'info');
    return;
  }
  
  try {
    // 格式化JSON数据
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(dataBlob);

    // 创建下载链接
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `english-log-${state.today}.json`;
    
    // 触发下载
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    }, 100);
    
    showNotification('数据导出成功！', 'success');
  } catch (error) {
    console.error('导出数据失败:', error);
    showNotification('数据导出失败，请稍后重试', 'error');
  }
}

// 导入数据（优化：避免重复导入）
function importData() {
  state.dom.fileInput.click();
}

// 处理文件导入
function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    // 使用FileReader读取文件内容
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const fileContent = event.target.result;
        const importedData = JSON.parse(fileContent);
        
        // 验证导入的数据结构
        if (!isValidImportData(importedData)) {
          showNotification('文件格式不正确，无法导入', 'error');
          return;
        }
        
        // 确认是否导入
        if (confirm('导入将自动跳过已存在的单词记录，只添加新的单词。是否继续？')) {
          const currentData = storage.get();
          let newEntriesCount = 0;
          
          // 合并数据（避免重复）
          for (const date in importedData) {
            if (!Object.prototype.hasOwnProperty.call(importedData, date)) continue;
            
            // 确保当前日期数组存在
            if (!currentData[date]) {
              currentData[date] = [];
            }
            
            // 为每个日期创建单词索引（用于快速查找重复，不区分大小写）
            const existingWordsMap = new Map();
            currentData[date].forEach(item => {
              existingWordsMap.set(item.word.toLowerCase(), true);
            });
            
            // 筛选出不重复的条目
            const uniqueEntries = importedData[date].filter(item => {
              const wordLower = item.word.toLowerCase();
              return !existingWordsMap.has(wordLower);
            });
            
            // 为新条目添加ID和时间戳
            uniqueEntries.forEach(item => {
              if (!item.id) {
                item.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
              }
              if (!item.timestamp) {
                item.timestamp = new Date(`${date} ${item.time || '00:00'}`).getTime();
              }
              // 将新单词添加到映射中，避免同一文件内的重复
              existingWordsMap.set(item.word.toLowerCase(), true);
            });
            
            // 添加不重复的条目
            if (uniqueEntries.length > 0) {
              currentData[date] = [...currentData[date], ...uniqueEntries];
              newEntriesCount += uniqueEntries.length;
            }
          }
          
          // 检查是否有新条目被添加
          if (newEntriesCount === 0) {
            showNotification('没有新的单词记录需要导入，所有单词已存在！', 'info');
            return;
          }
          
          // 保存合并后的数据
          if (storage.set(currentData)) {
            showNotification(`成功导入 ${newEntriesCount} 条新的单词记录！`, 'success');
            
            // 刷新相关视图
            if (state.currentTab === 'view') {
              viewEntries();
            }
          }
        }
      } catch (error) {
        console.error('解析JSON失败:', error);
        showNotification('文件格式错误，请选择正确的 JSON 文件', 'error');
      }
    };
    reader.onerror = function() {
      showNotification('读取文件失败', 'error');
    };
    reader.readAsText(file);
  } catch (error) {
    console.error('导入数据失败:', error);
    showNotification('文件格式错误，请选择正确的 JSON 文件', 'error');
  }
  
  // 重置文件输入，以便可以再次选择同一个文件
  state.dom.fileInput.value = '';
}

// 更新统计信息
function updateStats() {
  const data = storage.get();
  const dates = Object.keys(data);
  
  // 计算总记录数
  let totalEntries = 0;
  let maxDayCount = 0;
  
  dates.forEach(date => {
    const dayCount = data[date]?.length || 0;
    totalEntries += dayCount;
    if (dayCount > maxDayCount) {
      maxDayCount = dayCount;
    }
  });
  
  // 计算学习天数
  const learningDays = dates.length;
  
  // 计算今日单词数
  const todayEntries = data[state.today]?.length || 0;
  
  // 计算平均记录数
  const avgEntries = learningDays > 0 ? Math.round(totalEntries / learningDays * 10) / 10 : 0;
  
  // 更新头部统计
  if (state.dom.totalWords) state.dom.totalWords.textContent = totalEntries;
  if (state.dom.currentDateWords) state.dom.currentDateWords.textContent = todayEntries;
  if (state.dom.studyDays) state.dom.studyDays.textContent = learningDays;
  
  // 更新统计页面
  if (state.dom.statsTotalWords) state.dom.statsTotalWords.textContent = totalEntries;
  if (state.dom.statsStudyDays) state.dom.statsStudyDays.textContent = learningDays;
  if (state.dom.statsDailyAverage) state.dom.statsDailyAverage.textContent = avgEntries;
  if (state.dom.statsMaxDay) state.dom.statsMaxDay.textContent = maxDayCount;
  
  // 生成学习趋势图表
  generateStudyTrendChart(data);
}

// 生成学习趋势图表
function generateStudyTrendChart(data) {
  // 获取图表容器
  const chartContainer = document.querySelector('.chart-container');
  if (!chartContainer) return;
  
  // 清除现有的图表或占位符
  const existingChart = chartContainer.querySelector('canvas');
  const placeholder = chartContainer.querySelector('.chart-placeholder');
  
  if (existingChart) {
    chartContainer.removeChild(existingChart);
  }
  if (placeholder) {
    chartContainer.removeChild(placeholder);
  }
  
  // 创建Canvas元素
  const canvas = document.createElement('canvas');
  canvas.id = 'studyTrendChart';
  canvas.width = chartContainer.clientWidth;
  canvas.height = 250;
  canvas.style.width = '100%';
  canvas.style.height = '250px';
  chartContainer.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  
  // 获取最近30天的数据
  const days = 30;
  const chartData = [];
  const labels = [];
  const today = new Date();
  
  // 生成最近30天的日期和数据
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = data[dateStr]?.length || 0;
    
    // 对于标签，只显示每月的1号和最后一天
    const dayOfMonth = date.getDate();
    const monthLabel = date.getMonth() + 1;
    let label = '';
    
    if (dayOfMonth === 1 || i === 0 || i === days - 1) {
      label = `${monthLabel}/${dayOfMonth}`;
    }
    
    chartData.push(count);
    labels.push(label);
  }
  
  // 设置图表尺寸和边距
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const width = canvas.width - margin.left - margin.right;
  const height = canvas.height - margin.top - margin.bottom;
  
  // 绘制背景网格
  drawGrid(ctx, width, height, margin);
  
  // 计算最大值，确保y轴从0开始
  const maxValue = Math.max(...chartData, 5); // 确保至少有5的高度
  
  // 绘制柱状图
  drawBarChart(ctx, chartData, labels, width, height, margin, maxValue);
  
  // 绘制坐标轴
  drawAxes(ctx, width, height, margin, maxValue);
  
  // 绘制标题
  ctx.font = '14px Inter, sans-serif';
  ctx.fillStyle = '#1e293b'; // 文本主要颜色，代替var(--text-color)
  ctx.textAlign = 'center';
  ctx.fillText('最近30天学习记录', canvas.width / 2, margin.top - 5);
}

// 绘制背景网格
function drawGrid(ctx, width, height, margin) {
  ctx.strokeStyle = '#e2e8f0'; // 边框颜色，代替var(--border-color)
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;
  
  // 绘制水平线
  for (let i = 0; i <= 5; i++) {
    const y = margin.top + (height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + width, y);
    ctx.stroke();
  }
  
  // 绘制垂直线（每5天一条）
  for (let i = 0; i <= 30; i += 5) {
    const x = margin.left + (width / 29) * i;
    ctx.beginPath();
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, margin.top + height);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
}

// 绘制柱状图
function drawBarChart(ctx, data, labels, width, height, margin, maxValue) {
  const barWidth = Math.min(20, width / data.length * 0.8);
  const barSpacing = width / (data.length - 1 || 1);
  
  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    const barHeight = (value / maxValue) * height;
    const x = margin.left + i * barSpacing - barWidth / 2;
    const y = margin.top + height - barHeight;
    
    // 绘制渐变
    const gradient = ctx.createLinearGradient(x, y, x, margin.top + height);
    gradient.addColorStop(0, '#4361ee'); // 主色调，代替var(--primary-color)
    gradient.addColorStop(1, '#7209b7'); // 次要色调，代替var(--primary-light)
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // 绘制数值标签（只在有数据且不太小的柱上显示）
    if (value > 0 && barHeight > 15) {
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(value, x + barWidth / 2, y + 15);
    }
    
    // 绘制日期标签
    if (labels[i]) {
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#64748b'; // 文本次要颜色，代替var(--text-secondary)
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barWidth / 2, margin.top + height + 20);
    }
  }
}

// 绘制坐标轴
function drawAxes(ctx, width, height, margin, maxValue) {
  ctx.strokeStyle = '#94a3b8'; // 文本浅色，代替var(--text-light)
  ctx.lineWidth = 1;
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = 'var(--text-secondary)';
  ctx.textAlign = 'right';
  
  // 绘制Y轴
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + height);
  ctx.stroke();
  
  // 绘制Y轴刻度
  for (let i = 0; i <= 5; i++) {
    const y = margin.top + (height / 5) * i;
    const value = Math.round(maxValue - (maxValue / 5) * i);
    
    // 绘制刻度线
    ctx.beginPath();
    ctx.moveTo(margin.left - 5, y);
    ctx.lineTo(margin.left, y);
    ctx.stroke();
    
    // 绘制刻度值
    ctx.fillText(value.toString(), margin.left - 10, y + 4);
  }
  
  // 绘制X轴
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top + height);
  ctx.lineTo(margin.left + width, margin.top + height);
  ctx.stroke();
}

// 显示通知
function showNotification(message, type = 'info') {
  // 设置通知类型和图标
  const iconMap = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  // 设置通知样式类
  const typeClassMap = {
    success: 'notification-success',
    error: 'notification-error',
    warning: 'notification-warning',
    info: 'notification-info'
  };
  
  // 清空之前的类
  state.dom.notification.className = 'notification';
  state.dom.notification.classList.add(typeClassMap[type] || typeClassMap.info);
  
  // 设置图标和消息
  state.dom.notificationIcon.className = `fas ${iconMap[type] || iconMap.info}`;
  state.dom.notificationMessage.textContent = message;
  
  // 显示通知
  state.dom.notification.style.display = 'flex';
  state.dom.notification.style.opacity = '0';
  
  // 添加显示动画
  setTimeout(() => {
    state.dom.notification.style.opacity = '1';
  }, 10);
  
  // 自动隐藏
  setTimeout(() => {
    state.dom.notification.style.opacity = '0';
    setTimeout(() => {
      state.dom.notification.style.display = 'none';
    }, 300);
  }, 3000);
}

// 绑定事件监听器
function bindEventListeners() {
  // 表单提交事件
  state.dom.wordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addEntry();
  });
  
  // 标签页切换事件
  state.dom.tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      switchTab(button.dataset.tab);
    });
  });
  
  // 支持回车快速保存
  state.dom.word.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      state.dom.meaning.focus();
    }
  });
  
  state.dom.meaning.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      addEntry();
    }
  });
  
  // 搜索相关事件
  state.dom.searchButton.addEventListener('click', searchEntries);
  
  state.dom.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchEntries();
    }
  });
  
  state.dom.clearSearch.addEventListener('click', () => {
    state.dom.searchInput.value = '';
    state.dom.searchResults.innerHTML = `
      <div style="text-align: center; color: var(--text-light); padding: 2rem;">
        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
        输入关键词开始搜索
      </div>
    `;
    state.dom.searchInput.focus();
  });
  
  // 查看日期选择后自动刷新
  state.dom.viewDate.addEventListener('change', viewEntries);
  
  // 导入导出数据事件
  state.dom.exportData.addEventListener('click', exportData);
  state.dom.importData.addEventListener('click', importData);
  state.dom.fileInput.addEventListener('change', handleFileImport);
  
  // 清空数据事件
  state.dom.clearAllData.addEventListener('click', () => {
    if (confirm('确定要清空所有单词记录吗？此操作不可撤销！')) {
      if (storage.clear()) {
        showNotification('所有数据已成功清空！', 'success');
        updateStats();
        if (state.currentTab === 'view') {
          viewEntries();
        } else if (state.currentTab === 'search') {
          state.dom.searchResults.innerHTML = `
            <div style="text-align: center; color: var(--text-light); padding: 2rem;">
              <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
              输入关键词开始搜索
            </div>
          `;
        }
      }
    }
  });
  
  // 为所有按钮添加键盘访问支持
  document.querySelectorAll('button').forEach(btn => {
    btn.setAttribute('tabindex', '0');
    btn.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}

// 工具函数：HTML转义，防止XSS攻击
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 验证导入的数据结构
function isValidImportData(data) {
  if (!data || typeof data !== 'object') return false;
  
  // 检查数据结构是否为日期为键的对象
  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
    
    // 检查键是否为有效的日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(key)) return false;
    
    // 检查值是否为数组
    if (!Array.isArray(data[key])) return false;
    
    // 检查数组中的每个对象是否包含必要的字段
    for (const item of data[key]) {
      if (!item || typeof item !== 'object' || !item.word) return false;
    }
  }
  
  return true;
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // 如果DOM已经加载完成
  initApp();
}

// 暴露公共方法到window对象
window.switchTab = switchTab;
window.addEntry = addEntry;
window.viewEntries = viewEntries;
window.searchEntries = searchEntries;
window.exportData = exportData;
window.importData = importData;
window.deleteEntry = deleteEntry;
window.today = state.today;