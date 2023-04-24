/*:
 * @plugindesc 血条显示插件
 * @author Hale Lin
 *
 * @param gaugeWidth
 * @text 血条长度
 * @type number
 * @desc 目前默认为180，关系到状态显示，非必要请勿调整
 * @default 180
 */
(() => {
    const params_Hp_Gauge = PluginManager.parameters('HpGauge');
//=====================================================================================
    Sprite_Gauge.prototype.bitmapWidth = function() {
        return parseInt(params_Hp_Gauge['gaugeWidth']);
    };
//=====================================================================================
// 给血条加一个最大值的显示
    Sprite_Gauge.prototype.drawValue = function () {
        // const currentValue = this.currentValue();
        const currentValue = this.currentValue() + '/' + this.currentMaxValue();
        const width = this.bitmapWidth();
        const height = this.textHeight();
        this.setupValueFont();
        this.bitmap.drawText(currentValue, 0, 0, width, height, "right");
    };
//=====================================================================================

//     function Sprite_EnemyHPBar() {
//         this.initialize.apply(this, arguments);
//     }
//
//     Sprite_EnemyHPBar.prototype = Object.create(Sprite.prototype);
//     Sprite_EnemyHPBar.prototype.constructor = Sprite_EnemyHPBar;
//
//     Sprite_EnemyHPBar.prototype.initialize = function(enemySprite) {
//         Sprite.prototype.initialize.call(this);
//         this._enemySprite = enemySprite;
//         this.createBitmap();
//         this.update();
//     };
//
//     Sprite_EnemyHPBar.prototype.createBitmap = function() {
//         this.bitmap = new Bitmap(100, 8);
//         this.bitmap.fillAll("#000000");
//     };
//
//     Sprite_EnemyHPBar.prototype.update = function() {
//         Sprite.prototype.update.call(this);
//         if (this._enemySprite._enemy) {
//             this.visible = this._enemySprite.visible;
//             this.x = this._enemySprite.x - this.bitmap.width / 2 - 10;
//             this.y = this._enemySprite.y - this._enemySprite.height * 1.2;
//             this.bitmap.clearRect(0, 0, this.bitmap.width, this.bitmap.height);
//             this.bitmap.fillAll("#000000");
//             let hpRate = this._enemySprite._enemy.hpRate()
//             let color = ""
//             if (hpRate > 0.75)
//                 color = "#00CC00"
//             else if (hpRate > 0.5)
//                 color = "#D4AF37"
//             else if(hpRate > 0.25)
//                 color = "#FFA500"
//             else
//                 color = "#FF0000"
//             this.bitmap.fillRect(0, 0, this.bitmap.width * this._enemySprite._enemy.hpRate(), this.bitmap.height, color);
//         } else {
//             this.visible = false;
//         }
//     };
//     BattleManager.setSpriteset = function(spriteset) {
//         this._spriteset = spriteset;
//         //add
//         this._spriteset.createEnemyHPBars();
//     };
//     Spriteset_Battle.prototype.createEnemyHPBars = function() {
//         this._enemyHPBars = [];
//         for (var i = 0; i < this._enemySprites.length; i++) {
//             this._enemyHPBars[i] = new Sprite_EnemyHPBar(this._enemySprites[i]);
//             this.addChild(this._enemyHPBars[i]);
//         }
//     };
//
//     var _Spriteset_Battle_update = Spriteset_Battle.prototype.update;
//     Spriteset_Battle.prototype.update = function() {
//         _Spriteset_Battle_update.call(this);
//         for (var i = 0; i < this._enemyHPBars.length; i++) {
//             this._enemyHPBars[i].update();
//         }
//     };

    Window_BattleEnemy.prototype.drawItem = function(index) {
        // this.resetTextColor();
        let hpRate = this._enemies[index].hpRate()
        let color = ""
        if (hpRate > 0.75)
            color = "#ffffff"
        else if (hpRate > 0.5)
            color = "#D4AF37"
        else if(hpRate > 0.25)
            color = "#FFA500"
        else
            color = "#FF0000"
        this.changeTextColor(color)
        const name = this._enemies[index].name();
        const rect = this.itemLineRect(index);
        this.drawText(name, rect.x, rect.y, rect.width);
        // 颜色重置移到后面，避免其他地方变色
        this.resetTextColor();
    };

})()

