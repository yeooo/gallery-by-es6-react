require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

//引入json文件，一定要在路径前加 'json!'
let imageDatas = require('json!../data/imageDatas.json');

imageDatas = ((imageDatasAtrr) => {
	for (let i = 0, j = imageDatasAtrr.length; i < j; i++) {
		let singleImageData = imageDatasAtrr[i];

		singleImageData.imageURL = require('../images/' + singleImageData.fileName);

		imageDatasAtrr[i] = singleImageData;
	}

	return imageDatasAtrr;

})(imageDatas);

//获取区间内的一个随机值
let getRangeRandom = (low, high) => Math.floor(Math.random() * (high - low) + low);

/**
 * 获取0~30°之间任意一个角度
 */
let get30DegRandom = () => {
	return (Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30)
};

/**
 * 底部控制条组件
 */

class ControllerUnit extends React.Component{
	constructor(props){
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}
	/**
	 * 控制条点击事件
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	handleClick(e) {
		//如果点击的图片是居中的则执行翻转
		if (this.props.arrange.isCenter) {
			this.props.inverse();
		}else{//否则使其居中
			this.props.center()
		}
		e.stopPropagation();
		e.preventDefault();
	}
	render(){
		let controllerUnitClassName = 'controller-unit';
		if (this.props.arrange.isCenter) {
			controllerUnitClassName += ' is-center';
		}
		if (this.props.arrange.isInverse) {
			controllerUnitClassName += ' is-inverse';
		}
		return (
			<span className={controllerUnitClassName} onClick = {this.handleClick}></span>
			)
	}
}

//图片组件
class ImgFigure extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	/**
	 * ImgFigure的点击事件
	 * @return {[type]} [description]
	 */
	handleClick(e) {
		//如果点击的图片是居中的则执行翻转
		if (this.props.arrange.isCenter) {
			this.props.inverse();
		}else{//否则使其居中
			this.props.center()
		}
		e.stopPropagation();
		e.preventDefault();
	}
	render() {
		let styleObj = {};

		//如果props属性中指定了这张图片的位置，则使用
		if (this.props.arrange.pos) {
			styleObj = this.props.arrange.pos;
		}
		//如果图片的旋转角度有值并且不为0，添加旋转角度
		if (this.props.arrange.rotate) {
			(['Moz', 'Ms', 'Webkit', '']).forEach((value) => {
				styleObj[value + 'Transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)';
			})
		}
		//如果图片居中，则使其z-index增高防止其他元素挡住
		if (this.props.arrange.isCenter) {
			styleObj.zIndex = 11;
		}

		let imgFigureClassName = 'img-figure';
		imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse ' : '';
		return ( <figure className = {
				imgFigureClassName
			}
			style = {
				styleObj
			}
			onClick = {
				this.handleClick
			}>
			<img src = {
				this.props.data.imageURL
			}
			alt = {
				this.props.data.title
			}
			/>   
			<figcaption> <h2> { this.props.data.title } </h2> <div className = "img-back"
			onClick = {
				this.handleClick
			}>
			<p> {
				this.props.data.title
			} </p> </div> </figcaption ></figure> );
	}
}
class GalleryByApp extends React.Component {
		constructor(props) {
				super(props);
				this.Constant = {
					centerPos: {
						left: 0,
						right: 0
					},
					hPosRange: { //水平方向的取值范围
						leftSecX: [0, 0],
						rightSecX: [0, 0],
						y: [0, 0]
					},
					vPosRange: { //垂直方向
						x: [0, 0],
						topY: [0, 0]
					}
				};

				this.state = {
					imgsArrangeArr: [
						//{
						//  pos:{
						//    left:'0',
						//    top:'0'
						//  },
						//    rotate:0, //旋转角度
						//isInverse:false //正反面
						//isCenter:false 图片是否居中
						//}
					]
				};
			}
			/**
			 * 翻转图片
			 * @param[centerIndex] 当输入被执行inverse操作的图片对应的图片信息数组的index值
			 * return {Funtion} 这是一个闭包函数，其中return一个真正待被执行的函数
			 */

		inverse(index) {
				return () => {
					let imgsArrangeArr = this.state.imgsArrangeArr;
					imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

					//触发视图的重新渲染
					this.setState({
						imgsArrangeArr: imgsArrangeArr
					});

				}
			}
			/**
			 * 重新布局所有图片
			 * @param  {[type]} centerIndex [指定居中哪个图片]
			 * @return {[type]}             [description]
			 */
		rearrange(centerIndex) {
				let imgsArrangeArr = this.state.imgsArrangeArr,
					Constant = this.Constant,
					centerPos = Constant.centerPos,
					hPosRange = Constant.hPosRange,
					vPosRange = Constant.vPosRange,
					hPosRangeLeftSecX = hPosRange.leftSecX,
					hPosRangeRightSecX = hPosRange.rightSecX,
					hPosRangeY = hPosRange.y,
					vPosRangeTopY = vPosRange.topY,
					vPosRangeX = vPosRange.x,

					imgsArrangeTopArr = [],
					//取一个或者不取
					topImgNum = Math.floor(Math.random() * 2),
					topImgSpiceIndex = 0,
					imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);
				
				//首先居中 centerIndex的图片 居中图片不需要旋转
				imgsArrangeCenterArr[0] = {
					pos : centerPos,
					centerPos : 0,
					isCenter :true
				}

				//取出要布局上侧的图片的状态信息
				topImgSpiceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));

				imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpiceIndex, topImgNum);
				//布局位于上侧的图片
				imgsArrangeTopArr.forEach((value, index) => {
					imgsArrangeTopArr[index] = {
						pos: {
							top: getRangeRandom(vPosRangeTopY[0],
								vPosRangeTopY[1]),
							left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
						},
						rotate: get30DegRandom(),
						isCenter: false
					};
				});

				//布局左右两侧的图片
				for (let i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {

					let hPosRangeLORX = null;

					//前半部分是布局左边，右半部份布局右边
					if (i < k) {
						hPosRangeLORX = hPosRangeLeftSecX;
					} else {
						hPosRangeLORX = hPosRangeRightSecX;
					}
					imgsArrangeArr[i] = {
						pos: {
							top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
							left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
						},
						rotate: get30DegRandom(),
						isCenter : false
					};
				}
				if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
					imgsArrangeArr.splice(topImgSpiceIndex, 0, imgsArrangeTopArr[0]);
				}

				imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

				this.setState({
					imgsArrangArr: imgsArrangeArr
				});
			}
		/**
		 * 利用rearrange函数，居中对应index的图片
		 * @param [index] [需要被居中的图片对应的图片信息数组的index值]
		 * @return {funtion} [返回一个闭包函数]
		 */
		center(index) {
			return () => {
				this.rearrange(index);
			}
		}
		getInitialState() {
				return {
					imgsArrangeArr: [
						// {
						// 	pos: {
						// 		left: '0',
						// 		top: '0'
						// 	},
						// 	rotate:'0'//旋转角度
						// 	isInverse:false, //图片正反面
						// 	inCenter:false//图片是否居中
						// }
					]

				}

			}
		//组件加载之后，为每张图片计算其位置的范围
		componentDidMount() {
			let stageDom = ReactDOM.findDOMNode(this.refs.stage),
				stageW = stageDom.scrollWidth,
				stageH = stageDom.scrollHeight,
				//计算的值可能不是整数，通过Math.ceil()处理
				halfStageW = Math.ceil(stageW / 2),
				halfStageH = Math.ceil(stageH / 2);

			//拿到一个imageFigure的大小
			let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
				imgW = imgFigureDOM.scrollWidth,
				imgH = imgFigureDOM.scrollHeight,
				halfImgW = Math.ceil(imgW / 2),
				halfImgH = Math.ceil(imgH / 2);

			//计算中心图片的位置
			this.Constant.centerPos = {
					left: halfStageW - halfImgW,
					top: halfStageH - halfImgH
				}
			//计算左侧和右侧的图片排布取值范围
			this.Constant.hPosRange.leftSecX[0] = -halfImgW;
			this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
			this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
			this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
			this.Constant.hPosRange.y[0] = -halfImgH;
			this.Constant.hPosRange.y[1] = stageH - halfImgH;
			//计算上册区域图片排布位置的取值范围
			this.Constant.vPosRange.topY[0] = -halfImgH;
			this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
			this.Constant.vPosRange.x[0] = halfStageW - imgW;
			this.Constant.vPosRange.x[1] = halfStageW;

			this.rearrange(0);
		}
		render() {
				let controllerUnits = [],
					imgFigures = [];

				imageDatas.forEach((value, index) => {
						if (!this.state.imgsArrangeArr[index]) {
							this.state.imgsArrangeArr[index] = {
								pos: {
									left: 0,
									top: 0
								},
								rotate: 0,
								isInverse: false,
								isCenter:false
							}
						}
						imgFigures.push( < ImgFigure data = {
								value
							}
							key = {
								index
							}
							ref = {
								'imgFigure' + index
							}
							arrange = {
								this.state.imgsArrangeArr[index]
							}
							inverse = {
								this.inverse(index)
							}
							center ={
								this.center(index)
							}
							/>);
						controllerUnits.push(
							<ControllerUnit key={
												index
											} 
											arrange = {
												this.state.imgsArrangeArr[index]
											}
											center = {
												this.center(index)
											} 
											inverse = {
												this.inverse(index)
											}
							/>);
						});

					return ( < section className = "stage"
						ref = "stage" >
						< section className = "img-sec" > {
							imgFigures
						} < /section> <nav className = "controller-nav" > { controllerUnits } </nav > < /section>);
					}
				}

				GalleryByApp.defaultProps = {};

				export default GalleryByApp;