import * as THREE from "three";

class Snow {  //雪花类
    time = 0 
    textureLoader = new THREE.TextureLoader()

    constructor(num = 0, range = 0, texture = '') {  //数量 范围 材质路径
        this.num = num
        this.range = range
        this.particle = null
        this.texture = texture
        this.texturesMaps = []
        this.position = null
        this.gen()
    }

    gen() {
        const {num, range, texture,} = this
        const geometry = new THREE.BufferGeometry()
        const material = new THREE.PointsMaterial({   //点材质
            size: 1,    //大小
            transparent: true,   //是否透明
            opacity: 0.6,  //透明度
            depthWrite: false,  //渲染此材质是否对深度缓冲区有任何影响
            vertexColors: true,  //顶点着色
            map: this.textureLoader.load(texture),  //材质
            blending: THREE.AdditiveBlending // 在使用此材质显示对象时要使用何种混合 ： 雪花的黑色部分和背景融合
        })
        const position = [] // 每个粒子的位置
        const colors = []
        for (let x = 0; x < num; x++) {
            // 采用HSL颜色模式使得雪花明暗度变化
            const color = new THREE.Color()
            const asHSL = {h: 0, s: 0, l: 0}
            color.getHSL(asHSL)
            color.setHSL(asHSL.h, asHSL.s, asHSL.l * Math.random())
            colors.push(color.r, color.g, color.b)

            // 生成随机点坐标
            position.push( //math库会一次性生成
                THREE.MathUtils.randFloatSpread(range * 2),
                THREE.MathUtils.randFloatSpread(range * 2),
                THREE.MathUtils.randFloatSpread(range * 2)
            )

        }
        // 用更快的速度分配
        this.position = new THREE.Float32BufferAttribute(position, 3)
        geometry.setAttribute('position', this.position)
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        this.particle = new THREE.Points(geometry, material)
    }

    // 模拟下雪的动态效果：利用位置和速度，斜方向下雪
    snowing(speed = 0) {

        const {position, range} = this
        for (let i = 0; i < position.count; i++) {
            let pos_x = position.getX(i)
            let pos_y = position.getY(i)
            let pos_z = position.getZ(i)

            pos_x -= speed
            pos_y -= speed
            pos_z -= speed

            if (pos_x < -range) pos_x = range
            if (pos_y < -range) pos_y = range
            if (pos_z < -range) pos_z = range

            position.setX(i, pos_x)
            position.setY(i, pos_y)
            position.setZ(i, pos_z)
        }
        // 更新 position
        position.needsUpdate = true
    }
}

export default Snow
