import * as THREE from 'three';
/**
 * 贪吃蛇的控制类,实现运动方式和身体管理
 */
class snake{
    //传scene参,将构造蛇对象添加进scene内即可
    constructor(scene){
        this.scene=scene;
        this.snake_body=[]    //蛇身体数组
        this.sphereGeometry = new THREE.IcosahedronGeometry( 0.2, 5 );
		this.sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
        const sphere = new THREE.Mesh( this.sphereGeometry, this.sphereMaterial );
        this.length=0   //代表蛇的长度,从0开始,0下标代表蛇头,length下标代表蛇尾
        this.step=0.01  //设定每次前进的步幅,此处设定为0.01
        //this.bodySet=new Set();
        sphere.castShadow = true;
		sphere.receiveShadow = true;
        sphere.position.z-=1
        sphere.position.y-=1
        //console.log(sphere.position.distanceToSquared(sphere.position))
        scene.add(sphere)
        this.snake_body.push(sphere)
        var i=0;
        for(i=0;i<50;i++){
            this.addBody();
        }   

    }
    /**
     * 蛇向前移动,原理为蛇头复制摄像机位置
     */
    forward(position){
        this.isWall(position)
        var mid=this.snake_body[0].position;
        this.isCollision()
        this.snake_body[0].position.copy(position);
        
    }
    /**
     * 在吃到食物时,蛇身长度+1,并往snake数组内添加一个球
     */
    addBody(){
        var prePosition=this.snake_body[this.length].position;
        var sphere = new THREE.Mesh( this.sphereGeometry, this.sphereMaterial );
        //直接复制前一个身体组成,待改进
        sphere.position.x=prePosition.x;
        sphere.position.y=prePosition.y;
        sphere.position.z=prePosition.z+0.3;
       // sphere.position.copy(prePosition);
        this.snake_body.push(sphere);
        this.scene.add(sphere);
        this.length++; //蛇身长度加一
    }
    /**
     * 蛇身整体移动
     */
    bodyMove(){
        var len=this.length;
        for(;len>=1;len--){
            var prePosition=this.snake_body[len-1].position;
            this.snake_body[len].position.copy(prePosition);
        }
    }
    /**
     * 检测是否与蛇身碰撞
     */
    isCollision(){
        var i=3;
        var position=this.snake_body[0].position;
        for(;i<=this.length;i++){
            var nextPos=this.snake_body[i].position;
            var distance=position.distanceToSquared(nextPos);
            //25是半径乘半径
            if(distance<0.01){
                //alert("发生身体碰撞")
                window.location.href='http://localhost:2000/result.html';
            }

        }
    }
    /**
     * 检测是否与墙壁发生碰撞,实在不太好写，判断位置变化了
     */
    isWall(position){
        var distance=this.snake_body[0].position.distanceToSquared(position)
        if(distance<1e-6&&distance!=0)
        {
          // alert("撞墙死亡")
           window.location.href='http://localhost:2000/result.html';
        }
    }
}
export default snake