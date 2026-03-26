<template>
    <div class="wallet-page" style="min-height: calc(100vh - 120px); background: #fff; padding: 20px;">
      <!-- 顶部标题 + 返回点单按钮 -->
      <div class="wallet-header">
        <h2 class="wallet-title">我的钱包</h2>
        <div class="wallet-actions">
          <el-button type="text" @click="goToOrder" class="back-order-btn">
            <i class="el-icon-arrow-left"></i> 返回点单
          </el-button>
          <el-button type="text" @click="rechargeShow = true" class="recharge-btn">
            <i class="el-icon-plus"></i> 充值
          </el-button>
        </div>
      </div>
  
      <!-- 余额卡片 -->
      <div class="balance-card">
        <div class="balance-label">当前余额</div>
        <div class="balance-num">¥{{ walletBalance }}</div>
      </div>
  
      <!-- 交易记录 -->
      <div class="record-section">
        <h3 class="record-title">交易记录</h3>
        <div v-if="tradeRecords.length === 0" class="empty-record">
          暂无交易记录
        </div>
        <div v-else class="record-list">
          <div class="record-item" v-for="(item, i) in tradeRecords" :key="i">
            <div class="record-left">
              <div class="record-name">{{ item.title }}</div>
              <div class="record-time">{{ item.time }}</div>
            </div>
            <div class="record-right" :class="{ 'expense': item.type === 'expense', 'income': item.type === 'income' }">
              {{ item.type === 'expense' ? '-' : '+' }}¥{{ item.amount }}
            </div>
          </div>
        </div>
      </div>
  
      <!-- 充值弹窗（新增充值成功后自动返回选项） -->
      <el-dialog title="钱包充值" :visible.sync="rechargeShow" width="350px" center>
        <div class="recharge-form">
          <div class="recharge-amount">
            <span>充值金额</span>
            <el-input-number v-model="rechargeNum" :min="10" :max="1000" :step="10" size="large"></el-input-number>
          </div>
          <div class="recharge-back" style="margin-top:15px;">
            <el-checkbox v-model="backAfterRecharge">充值成功后自动返回点单</el-checkbox>
          </div>
        </div>
        <div slot="footer">
          <el-button @click="rechargeShow = false">取消</el-button>
          <el-button type="primary" @click="doRecharge">确认充值</el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  export default {
    name: "Wallet",
    data() {
      return {
        walletBalance: 100, // 初始余额100元
        tradeRecords: [],   // 交易记录
        rechargeShow: false,
        rechargeNum: 10,
        backAfterRecharge: true // 默认勾选：充值后自动返回
      };
    },
    created() {
      // 页面加载时读取本地存储的余额和记录
      const savedBalance = localStorage.getItem('mstand_wallet_balance');
      const savedRecords = localStorage.getItem('mstand_trade_records');
      
      if (savedBalance) this.walletBalance = Number(savedBalance);
      if (savedRecords) this.tradeRecords = JSON.parse(savedRecords);
    },
    methods: {
      // 返回点单页面（防重复跳转）
      goToOrder() {
        if (this.$route.path === '/mstand') {
          this.$message.info("当前已在点单页面");
          return;
        }
        this.$router.push('/mstand');
      },
  
      // 充值（支持自动返回 + 避免重复跳转）
      doRecharge() {
        if (this.rechargeNum <= 0) {
          this.$message.warning("请输入有效充值金额");
          return;
        }
        
        // 更新余额
        this.walletBalance += this.rechargeNum;
        // 生成交易记录
        const record = {
          title: "钱包充值",
          amount: this.rechargeNum,
          type: "income", // 收入
          time: this.formatTime(new Date())
        };
        this.tradeRecords.unshift(record);
        
        // 保存到本地
        this.saveWalletData();
        
        this.rechargeShow = false;
        this.$message.success(`充值成功！余额+¥${this.rechargeNum}`);
        
        // 如果勾选了自动返回，且当前不在点单页面，则延迟返回
        if (this.backAfterRecharge && this.$route.path !== '/mstand') {
          setTimeout(() => {
            this.goToOrder();
          }, 1500); // 延迟1.5秒返回，让用户看到成功提示
        }
      },
      
      // 扣钱（供MStand页面调用）
      deductMoney(amount, orderTitle) {
        return new Promise((resolve, reject) => {
          if (this.walletBalance < amount) {
            reject("余额不足，请先充值");
            return;
          }
          
          // 扣减余额
          this.walletBalance -= amount;
          // 生成消费记录
          const record = {
            title: orderTitle,
            amount: amount,
            type: "expense", // 支出
            time: this.formatTime(new Date())
          };
          this.tradeRecords.unshift(record);
          
          // 保存到本地
          this.saveWalletData();
          resolve("扣款成功");
        });
      },
      
      // 保存余额和记录到本地存储
      saveWalletData() {
        localStorage.setItem('mstand_wallet_balance', this.walletBalance);
        localStorage.setItem('mstand_trade_records', JSON.stringify(this.tradeRecords));
      },
      
      // 格式化时间
      formatTime(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}`;
      }
    }
  };
  </script>
  
  <style scoped>
  /* 顶部 */
  .wallet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .wallet-title {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
  }
  .wallet-actions {
    display: flex;
    gap: 10px;
  }
  .back-order-btn, .recharge-btn {
    color: #000;
    font-size: 14px;
  }
  
  /* 余额卡片 */
  .balance-card {
    background: #f7f7f7;
    border-radius: 12px;
    padding: 30px 20px;
    text-align: center;
    margin-bottom: 30px;
  }
  .balance-label {
    font-size: 16px;
    color: #999;
    margin-bottom: 10px;
  }
  .balance-num {
    font-size: 36px;
    font-weight: 700;
    color: #000;
  }
  
  /* 交易记录 */
  .record-section {
    margin-top: 30px;
  }
  .record-title {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 15px;
  }
  .empty-record {
    text-align: center;
    padding: 40px 0;
    color: #ccc;
  }
  .record-list {
    border-top: 1px solid #eee;
  }
  .record-item {
    display: flex;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
  }
  .record-name {
    font-weight: 500;
    margin-bottom: 4px;
  }
  .record-time {
    font-size: 12px;
    color: #999;
  }
  .record-right {
    font-weight: 500;
  }
  .expense {
    color: #f56c6c; /* 支出红色 */
  }
  .income {
    color: #67c23a; /* 收入绿色 */
  }
  
  /* 充值弹窗 */
  .recharge-amount {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  </style>