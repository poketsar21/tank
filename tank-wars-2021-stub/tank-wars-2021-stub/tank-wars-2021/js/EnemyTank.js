class EnemyTank extends BaseTank{
    /** @type {PlayerTank} */
    player
    /** @type {number} */
    tankspeed = 100
    constructor(scene, x, y, texture, frame, player){
        super(scene, x , y, texture, frame)
        this.player = player
        this.hull.angle = Phaser.Math.RND.angle()
    }
    initMovement(){
        this.scene.physics.velocityFromRotation(this.hull.rotation, this.tankspeed, this.hull.body.velocity)
    }
    update(time, delta){
        super.update()
        this.turret.rotation = Phaser.Math.Angle.Between(this.hull.x, this.hull.y, this.player.hull.x, this.player.hull.y)
    }
}