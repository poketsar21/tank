
class TankScene extends Phaser.Scene {
    /** @type {Phaser.Tilemaps.Tilemap} */
    map
    /** @type {Phaser.Tilemaps.TilemapLayer*/
    destructLayer
    preload() {
        this.load.image('Tileset', 'assets/tanks/landscape-tileset.png')
        this.load.tilemapTiledJSON('level1', 'assets/level1.json')

    }
    
    create() {
        this.map = this.make.tilemap({key: 'level1'})
        const landscape = this.map.addTilesetImage('landscape-tileset', 'Tileset')
        this.map.createLayer('groundLayer',[landscape], 0, 0)
        this.destructLayer = this.map.createLayer('destructableLayer', [landscape], 0, 0)
        this.destructLayer.setCollisionByProperty({collide:true})
        this.cameras.main.setBounds(0,0, this.map.widthInPixels, this.map.heightInPixels)
        this.physics.world.setBounds(0,0, this.map.widthInPixels, this.map.heightInPixels)

    }
    update(time, delta) {
        
    }
}