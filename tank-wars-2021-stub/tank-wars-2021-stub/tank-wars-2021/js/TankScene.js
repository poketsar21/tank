
class TankScene extends Phaser.Scene {
    /** @type {Phaser.Tilemaps.Tilemap} */
    map
    /** @type {Phaser.Tilemaps.TilemapLayer*/
    destructLayer
    /** @type {PlayerTank} */
    player
    /** @type {Array.<EnemyTank>} */
    enemyTanks = []
    /** @type {Phaser.Physics.Arcade.Group} */
    bullets
    /** @type {Phaser.Physics.Arcade.Group} */
    enemyBullets
    preload() {
        this.load.atlas('tank', 'assets/tanks/tanks.png', 'assets/tanks/tanks.json')
        this.load.atlas('enemy', 'assets/tanks/enemy-tanks.png', 'assets/tanks/tanks.json')
        this.load.image('Tileset', 'assets/tanks/landscape-tileset.png')
        this.load.image('bullet', 'assets/tanks/bullet.png')
        this.load.tilemapTiledJSON('level1', 'assets/level1.json')

    }

    create() {
        this.map = this.make.tilemap({ key: 'level1' })
        const landscape = this.map.addTilesetImage('landscape-tileset', 'Tileset')
        this.map.createLayer('groundLayer', [landscape], 0, 0)
        this.destructLayer = this.map.createLayer('destructableLayer', [landscape], 0, 0)
        this.destructLayer.setCollisionByProperty({ collides: true })
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        //create bullets
        this.enemyBullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        })
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        })
        const objectLayer = this.map.getObjectLayer('objectLayer')
        let enemyObjects = []
        let actor
        objectLayer.objects.forEach(function (object) {
            actor = Utils.RetrieveCustomProperties(object)
            console.log(actor)
            if (actor.type == 'playerSpawn') {
                this.createPlayer(actor)
            } else if (actor.type = 'enemySpawn') {
                enemyObjects.push(actor)
            }
        }, this)
        this.cameras.main.startFollow(this.player.hull, true, 0.25, 0.25)
        for (let i = 0; i < enemyObjects.length; i++) {
            this.createEnemy(enemyObjects[i])
        }
        this.input.on('pointerdown', this.tryShoot, this)
        this.physics.world.on('worldbounds', function(body){
            this.disposeOfBullet(body.gameObject)
        }, true)
    }
    update(time, delta) {
        this.player.update()
        for (let i = 0; i < this.enemyTanks.length; i++) {
            this.enemyTanks[i].update(time, delta)
        }
        
    }
    createEnemy(dataObject) {
        let enemyTank = new EnemyTank(this, dataObject.x, dataObject.y, 'enemy', 'tank1', this.player)
        enemyTank.initMovement()
        enemyTank.enableCollisions()
        this.physics.add.collider(enemyTank.hull, this.player.hull)
        this.enemyTanks.push(enemyTank)
        if (this.enemyTanks.length > 1) {
            for (let i = 0; i < this.enemyTanks.length - 1; i++) {
                this.physics.add.collider(enemyTank.hull, this.enemyTanks[i].hull)
            }
        }
    }
    createPlayer(dataObject) {
        this.player = new PlayerTank(this, dataObject.x, dataObject.y, 'tank', 'tank1')
        this.player.enableCollisions(this.destructLayer)

    }
    tryShoot(pointer){
        /** @type {Phaser.Physics.Arcade.Sprite} */
        let bullet = this.bullets.get(this.player.turret.x, this.player.turret.y)
        if(bullet){
            this.fireBullet(bullet, this.player.turret.rotation, this.enemyTanks)
        }
        
    }
    fireBullet(bullet, rotation,target){
        // bullet is a sprite
        bullet.setDepth(3)
        bullet.body.collideWorldBounds = true
        bullet.body.onWorldBounds = true
        bullet.enableBody(false, bullet.x, bullet.y, true, true)
        bullet.rotation = rotation
        this.physics.velocityFromRotation(bullet.rotation, 500, bullet.body.velocity)
        this.physics.add.collider(bullet, this.destructLayer, this.damageWall, null, this)
    }
    bulletHitEnemy(hull, bullet){

    }
    damageWall(bullet, tile){
        this.disposeOfBullet(bullet)
        // retrieve tileset firtgid ( used as a offset)
        let firstGid = this.destructLayer.tileset[0].firstgid
        // get next tile ID
        let nextTileID = tile.index + 1 - firstGid
        // get next tile properties
        let tileProperties = this.destructLayer.tileset[0].tileProperties[nextTileID]
        let newTile = this.destructLayer.putTileAt(nextTileID + firstGid, tile.x, tile.y)
    }
    disposeOfBullet(bullet){
        bullet.disableBody(true, true)
    }
}