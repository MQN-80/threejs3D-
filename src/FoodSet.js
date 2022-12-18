import * as THREE from 'three';
import snake from "./snake";
import {randInt} from "three/src/math/MathUtils";
/**
 * 贪吃蛇的食物生成类
 */

class FoodSet{

    constructor(scene) {
        this.scene=scene;
        this.foods=[]    //食物数组
    }



    setFood(num){
        this.sphereGeometry = new THREE.IcosahedronGeometry( 0.5, 10 );
        this.sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xff00ff } );
        if(num==1){
         var sphere1 = new THREE.Mesh( this.sphereGeometry, this.sphereMaterial );
            const foodlight1 = new THREE.PointLight(0xff00ff,1,3);
            sphere1.add(foodlight1);
            sphere1.castShadow = true;
            sphere1.receiveShadow = true;
            sphere1.position.y=-1;
            sphere1.position.x=randInt(-2,2);
            sphere1.position.z=randInt(-7,5);
            this.scene.add(sphere1);

            this.foods.push(sphere1);
        }
        else if(num===2){
            var sphere2 = new THREE.Mesh( this.sphereGeometry, this.sphereMaterial );
            const foodlight2 = new THREE.PointLight(0xff00ff,1,3);
            sphere2.add(foodlight2);
            sphere2.castShadow = true;
            sphere2.receiveShadow = true;
            sphere2.position.y=1;
            sphere2.position.x=randInt(14,16);
            sphere2.position.z=randInt(-11,18);
            this.scene.add(sphere2);

            this.foods.push(sphere2);
        }
        else if(num===3){
            var sphere3 = new THREE.Mesh( this.sphereGeometry, this.sphereMaterial );
            const foodlight3 = new THREE.PointLight(0xff00ff,1,3);
            sphere3.add(foodlight3);
            sphere3.castShadow = true;
            sphere3.receiveShadow = true;
            sphere3.position.y=1;
            sphere3.position.x=randInt(-4,0);
            sphere3.position.z=randInt(-9,0);
            this.scene.add(sphere3);

            this.foods.push(sphere3);
        }
        else if(num===4) {
            var sphere4 = new THREE.Mesh( this.sphereGeometry, this.sphereMaterial );
            const foodlight4 = new THREE.PointLight(0xff00ff,1,3);
            sphere4.add(foodlight4);
            sphere4.castShadow = true;
            sphere4.receiveShadow = true;
            sphere4.position.y=-1;
            sphere4.position.x=randInt(-11,-7);
            sphere4.position.z=randInt(-4,0);
            this.scene.add(sphere4);

            this.foods.push(sphere4);
        }
        else if(num===5){
            var sphere5 = new THREE.Mesh( this.sphereGeometry, this.sphereMaterial );
            const foodlight5 = new THREE.PointLight(0xff00ff,1,3);
            sphere5.add(foodlight5);
            sphere5.castShadow = true;
            sphere5.receiveShadow = true;
            sphere5.position.y=1;
            sphere5.position.x=randInt(-13,-6);
            sphere5.position.z=randInt(7,14);
            this.scene.add(sphere5);

            this.foods.push(sphere5);
        }

        return this.foods;
    }

    isEat(position){

        var size = this.foods.length;
        var i=0;
        for (i=0;i<size;i++){
            var distance=this.foods[i].position.distanceToSquared(position);

            if(distance<2){
                console.log("吃了一个食物！");
                console.log(this.foods[i].position)
                console.log(size)
                this.scene.remove(this.foods[i]);
                this.foods.splice(i,1);
                return true;
            }
        }
        return false;
    }
}
export default FoodSet