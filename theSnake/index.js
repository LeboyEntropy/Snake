window.onload = function(){
		// 蛇身体 和 食物 都需要创建 那么采用一个公共构造函数
		function Base(optWidth){
			this.width = optWidth || 20   // 每个格子的宽度
			this.height = optWidth || 20   // 每个格子的高度
			this.map = document.getElementById("s_body") 
			// console.log(this.map)
			this.mainWidth = this.map.clientWidth   // 容器的总宽度
			this.mainHeitht = this.map.clientHeight  // 容器的总高度
			this.cellX = this.mainWidth/this.width    // 水平方向的格子数
			this.cellY = this.mainHeitht/this.height   // 垂直方向的格子数
		}
		
		// Base 的原型方法 用于生成[0~number) 之间的随机数
		Base.prototype.randomNumber = function(number){
			return Math.floor(Math.random()*number)
		}
		
		// 花里胡哨随机生的颜色
		Base.prototype.randomColor = function(){
			// 这里因为背景是黑色，所以我只取一部分 避免冲突
			var arr = ["5","6","7","8","9","a","b","c","d","e","f"] 
			var strColor = "#" 
			for(var i = 0 ; i<6 ; i++){
				var randomIndex = this.randomNumber(11)
				strColor += arr[randomIndex]
			}
			return strColor 
		}
		
		//创建DOM （蛇的身体或者是 食物 都可以） 
		Base.prototype.createDOM = function(){
			var tempDOM  = document.createElement("div")
			tempDOM.style.width = this.width + "px" 
			tempDOM.style.height = this.height + "px" 
			tempDOM.style.position = "absolute" 
			tempDOM.style.backgroundColor = this.randomColor() 
			tempDOM.style.borderRadius = "50%"
			this.map.appendChild(tempDOM) 
			return tempDOM 
		}
		
		// 创建食物
		function Food(optWidth){
			Base.call(this,optWidth)   // 继承Base构造函数上的属性
			this.dom = null //dom食物节点
			this.currentCellX = 0   //当前食物所在水平方向上的格子数
			this.currentCellY = 0   // 当前食物所在垂直方向上的格子数
			this.init() 
		}
		Food.prototype = Object.create(Base.prototype)  // Food构造函数的原型指向Base构造函数的原型
		// Food.prototype = new Base()    // 用new的话 因为地图没实例出来 所以会报一个错 是还没有地图的dom
		Food.prototype.constructor = Food  // 原型重新指向Food构造函数，防止指向错乱
		
		Food.prototype.init = function(){
			if(this.dom === null ){  // 没有创建才创建，避免吃掉了食物 食物节点还在
				this.dom = this.createDOM() 
			}
			this.currentCellX = this.randomNumber(this.cellX) 
			this.currentCellY = this.randomNumber(this.cellY) 
			this.dom.style.left = this.width * this.currentCellX + "px" 
			this.dom.style.top = this.height * this.currentCellY + "px" 
			this.dom.style.backgroundColor = this.randomColor() 
		}
		
		// 蛇 
		function Snake(obj){
			Base.call(this,obj.optWidth) 
			this.score = 0 // 积分
			this.food = obj.food   // 蛇要吃食物 蛇和食物就通过参数联系在一起
			this.id = null   // 定时器 控制蛇的移动
			this.flag = true  //控制定时器和键盘监听事件只开一次
			this.direct = "right"  // 蛇移动的初始方向
			this.body = [
				[2,0,null], // 因为上面是向右 那么这个为头
				[1,0,null], // 身体1
				[0,0,null]  // 身体2
			]
			this.newBorn() 
		}
		Snake.prototype = Object.create(Base.prototype) 
		Snake.prototype.constructor = Snake 
		
		//蛇出生
		Snake.prototype.newBorn = function(){
			for(var i = 0 ; i<this.body.length ; i++){
				if(!this.body[i][2]){
					this.body[i][2] = this.createDOM() 
				}
				// 先有dom再有样式
				if(i == 0 ){
					this.body[i][2].style.borderRadius = "25%"
				}
				this.body[i][2].style.left = this.width * this.body[i][0] + "px" 
				this.body[i][2].style.top = this.width * this.body[i][1] + "px" 
			}
			
			if(this.flag){
				this.snakeKeyBorn()
				this.id = setInterval(function(){
					this.move() 
				}.bind(this),400)
				this.flag = false 
			}
			
		}
		
		// 按键盘改变蛇移动的方向
		Snake.prototype.snakeKeyBorn = function(){
			window.addEventListener("keyup",function(e){
				switch(e.keyCode){
					case 37:this.direct = "left";  break 
					case 38:this.direct = "up"  ; break 
					case 39:this.direct = "right" ; break 
					case 40:this.direct = "down"  ;break 
				}
			}.bind(this),false)
		}
		// 蛇移动
		Snake.prototype.move = function(){
			// 蛇身要走过的路 蛇头早就走过了？？？
			var size = this.body.length-1 
			for( ;size>0 ;size--){
				this.body[size][0] = this.body[size-1][0]  // 移动left格子数 this.body[0] 是头
				this.body[size][1] = this.body[size-1][1]  // 移动的top格子数 
			}
			switch(this.direct){
				case "up":   this.body[0][1] -=1; break 
				case "down": this.body[0][1] +=1; break 
				case "right":this.body[0][0] +=1; break 
				case "left": this.body[0][0] -=1; break 
			}
			this.eattingFood()  // 每次移动都判断是否吃到了食物
			this.newBorn()  //每次移动都要进行判断需不需要长身体啊，这里定时器重开了
			this.deadLine()  // 每次移动判断是否选择了死亡（撞墙啥的）
		}
		
		// 蛇吃到食物，食物位置改变，蛇变长
		Snake.prototype.eattingFood = function(){
			if(this.body[0][0] == this.food.currentCellX && this.body[0][1] == this.food.currentCellY){
				var tempBody = [] 
				var size = this.body.length - 1 
				tempBody.push(this.body[size][0],this.body[size][1],null)
				this.body.push(tempBody)
				this.food.init()  // 重生一个食物 重新随机渲染 模拟吃掉
				this.score += 5 // 积分增加
				document.getElementById("score").innerHTML = this.score
			}
		}
	
		// 碰到边界死亡？？？  碰到自己身体死亡？？？
		Snake.prototype.deadLine = function(){
			// 头横坐标
			var s_x = this.body[0][0]
			// 头纵坐标
			var s_y = this.body[0][1]
			// 碰到边界
			var tempFlag = s_x<0 || s_x>this.map.clientWidth/this.width-1 || s_y<0 || s_y>this.map.clientHeight/this.height-1 
			// 碰到身体
			var tempFlagBody = false;
			for(let j = 1; j<this.body.length; j++){
				if(this.body[j][0] == s_x && this.body[j][1] == s_y){
					tempFlagBody = true;
					break;
				}
			}
			// 判断
			if(tempFlag || tempFlagBody){
				this.score = 0
				document.getElementById("score").innerHTML = this.score
				clearInterval(this.id)
				this.food.dom.remove() 
				// 只是把dom项删除
				for(var i = 0 ; i<this.body.length ; i++){
					this.body[i][2].remove() 
				}
				// 清空body
				this.body = []
				alert("BOOM!你选择死亡,总共得分为:"+this.score) 
			}
			
		}
		
		
		// 因为是用固定的大小，为效果美观，若要修改，请在修改尺寸的时候请同步修改地图尺寸。
		;(function(){
		
			let food =  new Food(25)
			let obj = {
				food:food,
				optWidth:25
			}
			let snake = new Snake(obj)
			

			// 难度等级
			let levels =  document.getElementById("level").children
			// 索引之样式记录
			let levelIndex = 0;
			levels[levelIndex].style.backgroundColor = "orange"
			levels[levelIndex].style.color = "red";
			for(let i = 0; i < levels.length; i++){
				levels[i].onclick = function(){
					clearInterval(snake.id)
					let leFlag =  confirm("你确定要切换难度并开始？准备好之后请点确定");
					if(!leFlag){
						snake.id = setInterval(function(){
							snake.move()
						},(2-levelIndex)*150+100)
					}else{
						snake.id = setInterval(function(){
							snake.move()
						},(2-i)*150+100)
						levels[i].style.backgroundColor = "orange"
						levels[i].style.color = "red"
						levels[levelIndex].style.backgroundColor = "black"
						levels[levelIndex].style.color = "white"
						levelIndex = i
					}
				}
			}
			// 操作按钮
			let opts =  document.getElementById("s_tab").children
			let optIndex = 2;
			// 重置
			opts[2].onclick = function(){
				// 暴力一点？
				location.reload();
			}
			// 暂停
			opts[3].onclick = function(){
				clearInterval(snake.id)
			}
			// 继续
			opts[4].onclick = function(){
				if(!snake.body.length){
					alert("都死翘翘了还想着继续？赶快去重置吧！！")
					return;
				}
				clearInterval(snake.id)
				snake.id = setInterval(function(){
					snake.move()
				},(2-levelIndex)*150+100)
			}
			// 结束
			opts[5].onclick = function(){
				alert("你选择了结束游戏！总得分为："+snake.score)
				clearInterval(snake.id)
				food.dom.remove() 
				for(var i = 0 ; i<snake.body.length ; i++){
					snake.body[i][2].remove() 
				}
			}
			
		}());
		
}