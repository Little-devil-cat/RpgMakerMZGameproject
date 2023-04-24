/*:
 * @plugindesc 修改战斗信息
 * @author Hale Lin
 *
 * @param frameCount
 * @text
 * @type number
 * @desc 停留帧数
 * @default 20
 *
 */

(() => {
    const params_bmc = PluginManager.parameters('BattleMsgController');
    Window_BattleLog.prototype.messageSpeed = function() {
        // return 16;
        return params_bmc['frameCount'];
    };

    Window_BattleStatus.prototype.drawArrow = function(x, y) {
        if (this._arrowSprite) {
            this.removeChild(this._arrowSprite);
            this._arrowSprite.destroy()
            this._arrowSprite = null;
        }
        var bitmap = ImageManager.loadExPic("Arrow");
        this._arrowSprite = new Sprite(bitmap);
        this._arrowSprite.move(x, y);
        this.addChild(this._arrowSprite);
    };


    Window_BattleStatus.prototype.select = function (index) {
        this._index = index;
        if (this._cursorAll) {
            this.refreshCursorForAll();
        } else if (this.index() >= 0) {
            //主要改这部分
            const rect = this.itemRect(this.index());
            const rect2 = this.faceRect(index);
            this.drawArrow(rect2.x + 5, rect2.y + 5);
            this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
        } else {
            this.setCursorRect(0, 0, 0, 0);
            if (this._arrowSprite) {
                console.log("arrow:", this._arrowSprite)
                this.removeChild(this._arrowSprite);
                this._arrowSprite.destroy();
                this._arrowSprite = null;
            }
        }
        this.callUpdateHelp();
    }

    var _Window_BattleStatus_initialize =  Window_BattleStatus.prototype.initialize;
    Window_BattleStatus.prototype.initialize = function(rect) {
        _Window_BattleStatus_initialize.call(this, rect)
        this._arrowSprite = null;
    };
})()