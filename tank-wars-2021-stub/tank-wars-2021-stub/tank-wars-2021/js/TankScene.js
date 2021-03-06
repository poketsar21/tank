
class TankScene extends Phaser.Scene {
    /** @type {Phaser.Tilemaps.Tilemap} */
    map
    /** @type {Phaser.Tilemaps.TilemapLayer} */
    destructLayer
    /** @type {PlayerTank} */
    player
    /** @type {Array.<EnemyTank>} */
    enemyTanks = []
    /** @type {Phaser.Physics.Arcade.Group} */
    bullets
    /** @type {Phaser.Physics.Arcade.Group} */
    enemyBullets
    // todo change to non-physics group
    /** @type {Phaser.GameObjects.Group} */
    explosions
    /** @type {Phaser.GameObjects.Text} */
    healthText
    /** @type {Phaser.GameObjects.Text} */
    targetText
    /** @type {number} */
    targets = 7
    /** @type {Phaser.GameObjects.Text} */
    fuelText
    /** @type {Phaser.GameObjects.Text} */
    speedText
    /** @type {Phaser.GameObjects.Group} */
    fuelCanisters
    /** @type {Phaser.GameObjects.Group} */
    ammoSets
    /** @type {Phaser.GameObjects.Image} */
    UI
    /** @type {Phaser.GameObjects.Image} */
    f1
    /** @type {Phaser.GameObjects.Image} */
    f2
    /** @type {Phaser.GameObjects.Image} */
    f3
    /** @type {Phaser.GameObjects.Image} */
    f4
    /** @type {Phaser.GameObjects.Image} */
    f5
    /** @type {Phaser.GameObjects.Image} */
    f6
    /** @type {Phaser.GameObjects.Image} */
    h1
    /** @type {Phaser.GameObjects.Image} */
    h2
    /** @type {Phaser.GameObjects.Image} */
    h3
    /** @type {Phaser.GameObjects.Image} */
    h4
    /** @type {Phaser.GameObjects.Image} */
    h5
    /** @type {Phaser.GameObjects.Image} */
    h6
    
    preload() {
        this.load.atlas('tank', 'assets/tanks/tanks.png', 'assets/tanks/tanks.json')
        this.load.atlas('enemy', 'assets/tanks/enemy-tanks.png', 'assets/tanks/tanks.json')
        this.load.atlas('boss', 'assets/tanks/boss-tanks.png', 'assets/tanks/tanks.json')
        this.load.image('Tileset', 'assets/tanks/landscape-tileset.png')
        this.load.image('bullet', 'assets/tanks/bullet.png')
        this.load.image('fuel', 'assets/tanks/fuel.png')
        this.load.image('UI', 'assets/tanks/UIboard.png')
        this.load.image('b1', 'assets/tanks/b1.png')
        this.load.image('b2', 'assets/tanks/b2.png')
        this.load.image('b3', 'assets/tanks/b3.png')
        this.load.image('b4', 'assets/tanks/b4.png')
        this.load.image('b5', 'assets/tanks/b5.png')
        this.load.image('b6', 'assets/tanks/b6.png')
        this.load.spritesheet('explosion', 'assets/tanks/explosion.png', {
            frameWidth: 64,
            frameHeight: 64
        })
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
        this.fuelCanisters = this.add.group({
            defaultKey: 'fuelCanister'
        })
        this.ammoSets = this.add.group({
            defaultKey: 'ammoSet'
        })
        const objectLayer = this.map.getObjectLayer('objectLayer')
        let enemyObjects = []
        let actor
        objectLayer.objects.forEach(function (object) {
            actor = Utils.RetrieveCustomProperties(object)
            //console.log(actor)
            if (actor.type == 'playerSpawn') {
                this.createPlayer(actor)
            } else if (actor.type == 'enemySpawn' || actor.type == 'bossSpawn') {
                enemyObjects.push(actor)
            }
        }, this)
        this.cameras.main.startFollow(this.player.hull, true, 0.25, 0.25)
        for (let i = 0; i < enemyObjects.length; i++) {
            this.createEnemy(enemyObjects[i])
        }
        // create explosions
        this.explosions = this.add.group({
            defaultKey: 'explosion',
            maxSize: enemyObjects.length + 1
        })
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 23,
                first: 23
            }),
            frameRate: 24
        })
        this.input.on('pointerdown', this.tryShoot, this)
        this.physics.world.on('worldbounds', function (body) {
            this.disposeOfBullet(body.gameObject)
        }, this)
        /*this.healthText = this.add.text(16, 20, 'damage: ' + this.player.damageCount, {
            fontSize: '44px',
            color: '#FFF',
            fontFamily: 'Century Gothic, sans-serif'
        }).setScrollFactor(0, 0) */
        this.targetText = this.add.text(814, 539, ''+this.targets, {
            fontSize: '34px',
            color: '#000000',
            fontFamily: 'Century Gothic, sans-serif'
        }).setScrollFactor(0, 0)
        this.speedText = this.add.text(233, 540, '' + this.player.currentSpeed, {
            fontSize: '34px',
            color: '#000000',
            fontFamily: 'Century Gothic, sans-serif'
        }).setScrollFactor(0, 0)
        /*this.fuelText = this.add.text(350, 20, 'fuel: ' + this.player.fuel, {
            fontSize: '44px',
            color: '#FFF',
            fontFamily: 'Century Gothic, sans-serif'
        }).setScrollFactor(0, 0) */
        // this.healthText.setDepth(6)
        this.targetText.setDepth(7)
        // this.fuelText.setDepth(6)
        this.UI = this.add.image(500, 300, 'UI').setScrollFactor(0, 0)
        this.UI.setDepth(6)
        this.speedText.setDepth(7)
        this.f1 = this.add.image(65, 582, 'b1').setScrollFactor(0, 0)
        this.f1.setDepth(7)
        this.f2 = this.add.image(65, 561, 'b2').setScrollFactor(0, 0)
        this.f2.setDepth(7)
        this.f3 = this.add.image(65, 540, 'b3').setScrollFactor(0, 0)
        this.f3.setDepth(7)
        this.f4 = this.add.image(65, 519, 'b4').setScrollFactor(0, 0)
        this.f4.setDepth(7)
        this.f5 = this.add.image(65, 498, 'b5').setScrollFactor(0, 0)
        this.f5.setDepth(7)
        this.f6 = this.add.image(65, 477, 'b6').setScrollFactor(0, 0)
        this.f6.setDepth(7)
        this.h1 = this.add.image(938, 582, 'b1').setScrollFactor(0, 0)
        this.h1.setDepth(7)
        this.h2 = this.add.image(938, 561, 'b2').setScrollFactor(0, 0)
        this.h2.setDepth(7)
        this.h3 = this.add.image(938, 540, 'b3').setScrollFactor(0, 0)
        this.h3.setDepth(7)
        this.h4 = this.add.image(938, 519, 'b4').setScrollFactor(0, 0)
        this.h4.setDepth(7)
        this.h5 = this.add.image(938, 498, 'b5').setScrollFactor(0, 0)
        this.h5.setDepth(7)
        this.h6 = this.add.image(938, 477, 'b6').setScrollFactor(0, 0)
        this.h6.setDepth(7)
    }
    update(time, delta) {
        this.player.update()
        for (let i = 0; i < this.enemyTanks.length; i++) {
            this.enemyTanks[i].update(time, delta)
        }
        if(this.player.currentSpeed >= 1){
            this.speedText.setText('' + this.player.currentSpeed)
        }else{
            this.speedText.setText('' + this.player.currentSpeed*-1)

        }
        
        /*this.fuelText.setText('fuel: ' + this.player.fuel)
        if (this.player.fuel <= 0) {
            this.fuelText.setText('fuel: ' + 0)
        } */
        if (this.player.fuel < 3000) {
            this.f6.setAlpha(0)
        }
        if (this.player.fuel < 2000) {
            this.f5.setAlpha(0)
        }
        if (this.player.fuel < 1500) {
            this.f4.setAlpha(0)
        }
        if (this.player.fuel < 1000) {
            this.f3.setAlpha(0)
        }
        if (this.player.fuel < 500) {
            this.f2.setAlpha(0)
        }
        if (this.player.fuel == 0) {
            this.f1.setAlpha(0)
        }
        if (this.player.fuel >= 3000) {
            this.f6.setAlpha(1)
        }
        if (this.player.fuel >= 2000) {
            this.f5.setAlpha(1)
        }
        if (this.player.fuel >= 1500) {
            this.f4.setAlpha(1)
        }
        if (this.player.fuel >= 1000) {
            this.f3.setAlpha(1)
        }
        if (this.player.fuel >= 500) {
            this.f2.setAlpha(1)
        }
        if (this.player.fuel > 0) {
            this.f1.setAlpha(1)
        }
        //
        if (this.player.damageCount >= 1) {
            this.h6.setAlpha(0)
        }
        if (this.player.damageCount >= 2) {
            this.h5.setAlpha(0)
        }
        if (this.player.damageCount >= 4) {
            this.h4.setAlpha(0)
        }
        if (this.player.damageCount >= 6) {
            this.h3.setAlpha(0)
        }
        if (this.player.damageCount >= 8) {
            this.h2.setAlpha(0)
        }
        if (this.player.damageCount >= 10) {
            this.h1.setAlpha(0)
        }
    }
    createEnemy(dataObject) {
        let enemyTank
        if (dataObject.type == 'enemySpawn') {
            enemyTank = new EnemyTank(this, dataObject.x, dataObject.y, 'enemy', 'tank1', this.player)
        } else if (dataObject.type == 'bossSpawn') {
            enemyTank = new BossTank(this, dataObject.x, dataObject.y, 'boss', 'tank1', this.player)
        }
        enemyTank.initMovement()
        enemyTank.enableCollisions(this.destructLayer)
        enemyTank.setBullets(this.enemyBullets)
        this.physics.add.collider(enemyTank.hull, this.player.hull)
        this.enemyTanks.push(enemyTank)
        if (this.enemyTanks.length > 1) {
            for (let i = 0; i < this.enemyTanks.length - 1; i++) {
                this.physics.add.collider(enemyTank.hull, this.enemyTanks[i].hull)
            }
        }
        console.log(this.enemyTanks.length)
    }
    createPlayer(dataObject) {
        this.player = new PlayerTank(this, dataObject.x, dataObject.y, 'tank', 'tank1')
        this.player.enableCollisions(this.destructLayer)

    }
    tryShoot(pointer) {
        /** @type {Phaser.Physics.Arcade.Sprite} */
        let bullet = this.bullets.get(this.player.turret.x, this.player.turret.y)
        if (bullet) {
            this.fireBullet(bullet, this.player.turret.rotation, this.enemyTanks)
        }


    }
    fireBullet(bullet, rotation, target) {
        // bullet is a sprite
        bullet.setDepth(3)
        bullet.body.collideWorldBounds = true
        bullet.body.onWorldBounds = true
        bullet.enableBody(false, bullet.x, bullet.y, true, true)
        bullet.rotation = rotation
        this.physics.velocityFromRotation(bullet.rotation, 500, bullet.body.velocity)
        this.physics.add.collider(bullet, this.destructLayer, this.damageWall, null, this)
        if (target === this.player) {
            this.physics.add.overlap(this.player.hull, bullet, this.bulletHitPlayer, null, this)
        } else {
            for (let i = 0; i < this.enemyTanks.length; i++) {
                this.physics.add.overlap(this.enemyTanks[i].hull, bullet, this.bulletHitEnemy, null, this)
            }
        }
    }
    bulletHitPlayer(hull, bullet) {
        this.disposeOfBullet(bullet)
        this.player.damage()
        // this.healthText.setText('damage: ' + this.player.damageCount)
        if (this.player.isDestroyed()) {
            this.input.enabled = false
            this.enemyTanks = []
            this.physics.pause()
            let explosion = this.explosions.get(hull.x, hull.y)
            if (explosion) {
                this.activateExplosion(explosion)
                explosion.play('explode')
            }
        }
    }
    bulletHitEnemy(hull, bullet) {
        /** @type {EnemyTank} */
        let enemy
        /** @type {number} */
        let index
        for (let i = 0; i < this.enemyTanks.length; i++) {
            if (this.enemyTanks[i].hull === hull) {
                index = i
                enemy = this.enemyTanks[i]
                break
            }

        }
        this.disposeOfBullet(bullet)
        console.log(enemy)
        enemy.damage()
        if (enemy.isImomobilised()) {
            let explosion = this.explosions.get(hull.x, hull.y)
            if (explosion) {
                this.activateExplosion(explosion)
                explosion.on('animationcomplete', this.animComplete, this)
                explosion.play('explode')
            }
            if (enemy.isDestroyed()) {
                this.enemyTanks.slice(index, 1)
                this.targets--
                console.log(this.enemyTanks.length)
                this.targetText.setText('' + this.targets)
                // this.fuelCanisters.create(enemy.hull.x, enemy.hull.y, 'fuel')
                let fuelCanister = this.physics.add.sprite(enemy.hull.x, enemy.hull.y, 'fuel').setDepth(2)
                this.fuelCanisters.setDepth(2)
                this.physics.add.overlap(this.player.hull, fuelCanister, this.refill, null, this)
            }
        }
    }
    activateExplosion(explosion) {
        explosion.setDepth(5)
        explosion.setActive(true)
        explosion.setVisible(true)
    }
    damageWall(bullet, tile) {
        this.disposeOfBullet(bullet)
        // retrieve tileset firtgid ( used as a offset)
        let firstGid = this.destructLayer.tileset[0].firstgid
        // get next tile ID
        let nextTileID = tile.index + 1 - firstGid
        // get next tile properties
        let tileProperties = this.destructLayer.tileset[0].tileProperties[nextTileID]
        let newTile = this.destructLayer.putTileAt(nextTileID + firstGid, tile.x, tile.y)
        if (tileProperties && tileProperties.collides) {
            newTile.setCollision(true)
        }
    }
    disposeOfBullet(bullet) {
        bullet.disableBody(true, true)

    }
    animComplete(animation, frame, gameObject) {
        this.explosions.killAndHide(gameObject)
    }
    refill(hull, fuelCanister) {
        console.log('refill')
        this.player.fuel += 500
        // this.fuelText.setText('fuel: ' + this.player.fuel)
        fuelCanister.destroy()
    }
}