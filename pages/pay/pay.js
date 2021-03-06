const app = getApp()
Page({
	data: {
		weCharstatus: true,   // 全选状态，默认全选
		yuestutea: false,
		isFocus: false,//控制input 聚焦
		wallets_password_flag: false,//密码输入遮罩
		actual_fee: '20',
		actualpayment: '',
		orderid: [],
		clock: ''
	},
	/*取消支付*/
	qxpay(){
	 console.log(1);
     wx.redirectTo ({
			url: '../m-order/m-order?sta=0',
				})
	},
	/*30分钟内完成支付*/
	// 支付
	selectAll(e) {
		let weCharstatus = this.data.weCharstatus;
		let yuestutea = this.data.yuestutea;
		weCharstatus = !weCharstatus;
		console.log(weCharstatus);
		if (weCharstatus == true) {
			this.setData({
				weCharstatus: weCharstatus,
				yuestutea: false
			});
		} else {
			this.setData({
				weCharstatus: weCharstatus,
			});
		}
	},
	selectAlls(e) {
		let yuestutea = this.data.yuestutea;
		yuestutea = !yuestutea;
		console.log(yuestutea);
		this.setData({
			yuestutea: yuestutea,
			weCharstatus: false,
		});
	},
	set_wallets_password(e) {//获取钱包密码
		var uid = wx.getStorageSync("userinfo").uid;
		var that = this;
		that.setData({
			wallets_password: e.detail.value
		});
		if (that.data.wallets_password.length == 6) {//密码长度6位时，自动验证钱包支付结果
			console.log(that.data.wallets_password);
			console.log(that.data.orderid);
			console.log(uid);

			this.setData({
				isFocus: false
			})
			wx.request({
				url: app.globalData.Murl+'/Applets/Cart/YuE_pay',
				data: {
					member_id: uid,
					inp_v: that.data.wallets_password,
					show_id: that.data.orderid,

					//
				},
				method: 'POST',
				header: { 'Content-Type': 'application/json' },
				success: function (res) {
					console.log(res.data)
					var datalist = res.data;
					if (datalist.data == -1) {
						wx.showToast({
							title: '您还未设置密码',
							icon: 'loading',
							duration: 2000
						})
					} else if (datalist.data == 1) {
						wx.showToast({
							title: '支付成功',
							icon: 'success',
							duration: 2000
						})
						wx.redirectTo({
								url: '../m-order/m-order?sta='+0,
							})
					} else if (datalist.data == -4) {
						wx.showToast({
							title: '余额不足,请充值',
							icon: 'none',
							duration: 2000
						})
					} else if (datalist.data == -3) {
						wx.showToast({
							title: '密码错误',
							icon: 'loading',
							duration: 2000
						})
					}
				}
			})
		}
	},
	set_Focus() {//聚焦input
		console.log('isFocus', this.data.isFocus)
		this.setData({
			isFocus: true
		})
	},
	set_notFocus() {//失去焦点
		this.setData({
			isFocus: false
		})
	},
	close_wallets_password() {//关闭钱包输入密码遮罩
		this.setData({
			isFocus: false,//失去焦点
			wallets_password_flag: false,
			wallets_password: '',
		})
	},
	pay: function () {
		 var orderid = this.data.orderid;
		 var openid = wx.getStorageSync("userinfo").openId;
		 let weCharstatus = this.data.weCharstatus;
		 let yuestutea = this.data.yuestutea;
		 var _this=this;
		/*微信支付*/
		wx.request({
				url: app.globalData.Murl+'/Applets/Cart/pdkc',
				data: {
					show_id: orderid
				},
				method: 'POST',
				header: { 'Content-Type': 'application/json' },
				success: function (res) {
					console.log(res.data.data);
					const datas = res.data;
					if(datas.status==true){
						console.log(res.data);
					if (weCharstatus == true) {
						console.log(weCharstatus);
						console.log(orderid);
						wx.request({
							url: app.globalData.Murl+'/Applets/Api/index',
							data: {
								openid: openid,
								orderid: orderid
								//
							},
							method: 'POST',
							header: { 'Content-Type': 'application/json' },
							success: function (res) {
								console.log(res)
								wx.requestPayment({
									'timeStamp': res.data['timeStamp'],
									'nonceStr': res.data['nonceStr'],
									'package': res.data['package'],
									'signType': 'MD5',
									'paySign': res.data['paySign'],
									'success': function (res) {
										wx.showToast({
											title: '支付成功',
											icon: 'success',
											duration: 2000
										})
										wx.redirectTo({
												url: '../m-order/m-order?sta='+0,
											})
									},
									'fail': function (res) {

									}
								})
							}
						})
					} else if (yuestutea == true) {
						_this.setData({
							wallets_password_flag: true,
							isFocus: true
						})
					}
					}else{
						wx.showToast({
							title: datas.data,
							icon: 'none',
							duration: 2000
						})
					}
				}
			})
	},
	/*设置密码*/
	newpwd(e) {
		wx.navigateTo({
			url: '../m-payPsw/m-payPsw',
			success: function (res) { console.log(res) },
			fail: function (res) { console.log(res) },
			complete: function (res) { console.log(res) },
		})
	},
	onLoad: function (options) {
		/*获取当前时间*/
		var timestamp = (new Date()).valueOf();
		/*获取30分钟后的时间*/
		var getSpeicalTime = function () {
			var now = new Date;
			now.setMinutes(now.getMinutes() + 30);
			return now;
		}
		var date = new Date(getSpeicalTime());
		var time2 = date.valueOf();
		var times = time2 - timestamp;
		var total_micro_second = times;

		/* 毫秒级倒计时 */
		function count_down(that) {
			// 渲染倒计时时钟
			that.setData({
				clock: date_format(total_micro_second)
			});

			if (total_micro_second <= 0) {
				wx.showToast({
					title: '30分钟内未完成付款，请重新下单',
					icon: 'none',
					duration: 2000
				})
				wx.switchTab({
					url: '../index/index'
				})
				// timeout则跳出递归
				return;
			}
			setTimeout(function () {
				// 放在最后--
				total_micro_second -= 10;
				count_down(that);
			}, 10)
		}
		function date_format(micro_second) {
			// 秒数
			var second = Math.floor(micro_second / 1000);
			// 小时位
			var hr = Math.floor(second / 3600);
			// 分钟位
			var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
			// 秒位
			var sec = fill_zero_prefix((second - hr * 3600 - min * 60));// equal to => var sec = second % 60;
			// 毫秒位，保留2位
			var micro_sec = fill_zero_prefix(Math.floor((micro_second % 1000) / 10));

			return min + ":" + sec;
		}

		// 位数不足补零
		function fill_zero_prefix(num) {
			return num < 10 ? "0" + num : num
		}
		count_down(this);
		var userinfo = wx.getStorageSync("userinfo");
		var uid = userinfo.uid;
		var _this = this;
		console.log(123213213);
		console.log(options.order_number);
		wx.request({
			url: app.globalData.Murl+'/Applets/Cart/pay',
			data: {
				member_id: uid,//用户id
				order_number: options.order_number
			},
			method: 'POST',
			header: { 'Content-Type': 'application/json' },
			success: function (res) {
				console.log(res.data);
				const datas = res.data;
				_this.setData({
					money: datas.money,
					orderid: datas.order_id,
				})
			}
		})
	}
})
