/*:
 * @plugindesc 战斗界面增加行动顺序显示条
 * @author Hale Lin
 *
 * @param textOpacity
 * @text 文字条不透明度
 * @type number
 * @desc 目前默认为192，公式为textOpacity / 255
 * @default 192
 *
 * @param gaugeWidth
 * @text 血条长度
 * @type number
 * @desc 目前默认为180，关系到状态显示，非必要请勿调整
 * @default 180
 *
 * @param scale
 * @text 行动条头像缩放
 * @type number
 * @desc 目前默认为0.5
 * @default 0.5
 *
 * @param lineHeight
 * @text 行高
 * @type number
 * @desc 引擎初始默认为36
 * @default 30
 */
(() => {
const params_action_queue = PluginManager.parameters('ActionQueue');
// 实现文字条在行动顺序下方

Scene_Battle.prototype.logWindowRect = function() {
    const wx = Graphics.boxWidth / 4;
    const wy = Graphics.boxHeight / 9;
    const ww = Graphics.boxWidth / 2;
    const wh = this.calcWindowHeight(10, false);
    return new Rectangle(wx, wy, ww, wh);
};

Window_BattleLog.prototype.drawLineText = function(index) {
    const rect = this.lineRect(index);
    this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
    // this.drawTextEx(this._lines[index], rect.x, rect.y, rect.width);
    this.drawTextExCenter(this._lines[index], rect.x, rect.y, rect.width);
};

Window_Base.prototype.drawTextExCenter = function(text, x, y, width) {
    // 计算文本宽度
    const textWidth = this.drawTextEx(text, 0, this.contents.height);
    // 计算左侧边距
    const leftMargin = (this.width - textWidth) / 2;
    // 输出文本
    this.drawTextEx(text, x + leftMargin, y, width);
};
// 实现文字条不透明度25
Window_BattleLog.prototype.backPaintOpacity = function() {
    // return 64;
    return JSON.parse(params_action_queue['textOpacity']);
};

//=====================================================================================
// 玩家战斗栏改矮到原来的6/5左右
Window_Base.prototype.lineHeight = function() {
    return JSON.parse(params_action_queue['lineHeight']);
};
//=====================================================================================
// 拉长血条长度
// Window_StatusBase.prototype.placeGauge = function(actor, type, x, y) {
//     const key = "actor%1-gauge-%2".format(actor.actorId(), type);
//     const sprite = this.createInnerSprite(key, Sprite_Gauge);
//     sprite.setup(actor, type);
//     sprite.move(x, y);
//     //add
//     sprite.scale.x = 1.5
//     sprite.show();
// };
Sprite_Gauge.prototype.bitmapWidth = function() {
    return JSON.parse(params_action_queue['gaugeWidth']);
};

//=====================================================================================

BattleManager.startTurn = function () {
    this._phase = "turn";
    $gameTroop.increaseTurn();
    $gameParty.requestMotionRefresh();
    if (!this.isTpb()) {
        // 让速度计算在回合初进行
        // this.makeActionOrders();
        this._logWindow.startTurn();
        this._inputting = false;
    }
};
//为了标注谁在行动，把删除actionBattler移到行动后
// BattleManager.updateTurn = async function(timeActive) {
//     $gameParty.requestMotionRefresh();
//     if (this.isTpb() && timeActive) {
//         this.updateTpb();
//     }
//     if (!this._subject) {
//         this._subject = this.getNextSubject();
//     }
//     if (this._subject) {
//         this.processTurn();
//
//         //add
//         await new Promise(resolve => setTimeout(resolve, 500));
//         this._actionBattlers.shift();
//
//     } else if (!this.isTpb()) {
//         this.endTurn();
//     }
// };
// BattleManager.getNextSubject = function() {
//     // for (;;) {
//     // const battler = this._actionBattlers.shift();
//     for (let i = 0;;i++) {
//         const battler = this._actionBattlers[i];
//         if (!battler) {
//             return null;
//         }
//         if (battler.isBattleMember() && battler.isAlive()) {
//             return battler;
//         }
//     }
// };
BattleManager.startBattle = function () {
    this._phase = "start";
    $gameSystem.onBattleStart();
    $gameParty.onBattleStart(this._preemptive);
    $gameTroop.onBattleStart(this._surprise);
    this.makeActionOrders() // add
    this.displayStartMessages();
};
BattleManager.endTurn = function () {
    this._phase = "turnEnd";
    this._preemptive = false;
    this._surprise = false;
    this.makeActionOrders() // add
};

BattleManager.makeActionOrders = function () {
    const battlers = [];
    if (!this._surprise) {
        battlers.push(...$gameParty.battleMembers());
    }
    if (!this._preemptive) {
        battlers.push(...$gameTroop.members());
    }
    for (const battler of battlers) {
        // // battler.makeSpeed();
        // if (battler._enemyId) {
        //     battler._speed = battler.agi * 100
        // }
        // // 敏捷 * 0.8 ~ 1.2 + 等级 * 0.1
        // else {
        //     battler._speed = battler.agi * Math.floor((Math.random() * 0.4 + 0.8) * 100) + battler._level * 0.1
        // }
        battler._speed = battler.agi * Math.floor((Math.random() * 0.6 + 0.7) * 100);
    }
    battlers.sort((a, b) => b.speed() - a.speed());
    console.log(battlers)
    this._actionBattlers = battlers;
};
//=====================================================================================
// ImageManager加载自己的静态资源
ImageManager.loadExPic = function(filename) {
    return this.loadBitmap("img/extra_pictures/", filename);
};
//=====================================================================================
function Window_Speed() {
    this.initialize.apply(this, arguments);
}

Window_Speed.prototype = Object.create(Window_Base.prototype);
Window_Speed.prototype.constructor = Window_Speed;

Window_Speed.prototype.initialize = function (rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this.createBackground();
    this.refresh();
};

Window_Speed.prototype.createBackground = function () {
    //设置无边框
    this.setBackgroundType(2);
    this._windowBackSprite = new Sprite();
    this.addChildToBack(this._windowBackSprite);
    this._windowBackSprite.bitmap = ImageManager.loadExPic('行动顺序背景图');
    this._windowBackSprite.scale.x = this.width / 2560
    this._windowBackSprite.scale.y = this.height / 180
    this._windowBackSprite.setFrame(0, 0, 2560, 180);
}

//=====================================================================================
// 敌方Sprite
function Sprite_myEnemy(enemy) {
    Sprite.call(this);
    this._enemy = enemy;
    this.createMainBitmap();
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
}

Sprite_myEnemy.prototype = Object.create(Sprite.prototype);
Sprite_myEnemy.prototype.constructor = Sprite_myEnemy;

// 加载敌人图像
Sprite_myEnemy.prototype.createMainBitmap = function () {
    var name = this._enemy.battlerName();
    var hue = this._enemy.battlerHue();
    this.bitmap = ImageManager.loadSvEnemy(name, hue);
};
Sprite_myEnemy.prototype.drawBorder= function () {
    const border = new PIXI.Graphics();
    border.lineStyle(5, 0x000000,1);
    border.drawRect(-this.width/2, -this.height/2, this.width, this.height);
    this.addChild(border);
}

//=====================================================================================
//我方Sprite
function Sprite_myActor(actor) {
    Sprite.call(this);
    this._actor = actor;
    this.createMainBitmap();
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
}

Sprite_myActor.prototype = Object.create(Sprite.prototype);
Sprite_myActor.prototype.constructor = Sprite_myActor;

// 加载友军图像
Sprite_myActor.prototype.createMainBitmap = function () {
    var name = this._actor._faceName;
    this.bitmap = ImageManager.loadFace(name);
};
Sprite_myActor.prototype.drawBorder= function () {
    const border = new PIXI.Graphics();
    border.lineStyle(5, 0x000000, 1);
    border.drawRect(-this.width/2, -this.height/2, this.width, this.height);
    this.addChild(border);
}
//=====================================================================================
// 创建速度窗口
Window_Speed.prototype.refresh = async function () {
    if (this._innerChildren.length !== BattleManager._actionBattlers.length) {
        if (this._innerChildren.length > BattleManager._actionBattlers.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        let children_length = this._innerChildren.length;
        for (var i = 0; i < children_length; i++) {
            this._innerChildren.shift().destroy();
        }
        let length = BattleManager._actionBattlers.length;
        for (const actionBattler of BattleManager._actionBattlers) {
            if (actionBattler._states.indexOf(1) >= 0 || actionBattler._hidden) {
                length--;
            }
        }
        let scale = JSON.parse(params_action_queue['scale']);
        let spacingX = ImageManager.faceWidth * 0.5 * scale * 1.5
        let x = (Graphics.boxWidth - spacingX * length) / 2;
        let y = this.innerHeight / 2;
        let firstFlag = true
        for (const actionBattler of BattleManager._actionBattlers) {
            // 死了就不画了
            if (actionBattler._states.indexOf(1) >= 0 || actionBattler._hidden) {
                continue
            }
            if (actionBattler._actorId) {
                let spriteActor = new Sprite_myActor(actionBattler)
                spriteActor.setFrame((actionBattler._faceIndex % 4) * ImageManager.faceWidth + ImageManager.faceWidth / 4, Math.floor(actionBattler._faceIndex / 4) * ImageManager.faceHeight + ImageManager.faceHeight / 4, ImageManager.faceWidth * 0.5, ImageManager.faceHeight * 0.5)
                spriteActor.scale.x = firstFlag ? 0.7 : scale;
                spriteActor.scale.y = firstFlag ? 0.7 : scale;
                spriteActor.x = x;
                spriteActor.y = y;
                spriteActor.drawBorder()
                this.addInnerChild(spriteActor);
            } else {
                let spriteEnemy = new Sprite_myEnemy(actionBattler)
                spriteEnemy.setFrame(ImageManager.faceWidth * 0.25, 0, ImageManager.faceWidth * 0.5, ImageManager.faceHeight * 0.5);
                spriteEnemy.scale.x = firstFlag ? 0.7 : scale;
                spriteEnemy.scale.y = firstFlag ? 0.7 : scale;
                spriteEnemy.x = x;
                spriteEnemy.y = y;
                spriteEnemy.drawBorder()
                this.addInnerChild(spriteEnemy);
            }
            x += spacingX;
            firstFlag = false
        }
    }

};

Scene_Battle._speedWindow = null

Scene_Battle.prototype.createAllWindows = function () {
    this.createLogWindow();
    this.createStatusWindow();
    this.createPartyCommandWindow();
    this.createActorCommandWindow();
    this.createHelpWindow();
    this.createSkillWindow();
    this.createItemWindow();
    this.createActorWindow();
    this.createEnemyWindow();
    this.createSpeedWindow(); // 创建速度窗口
    Scene_Message.prototype.createAllWindows.call(this);
};
//移动一下help窗口不然会被挡到 => 改的跟战斗描述一样
Scene_Battle.prototype.helpAreaTop = function() {
    return  Graphics.boxHeight - this.helpAreaHeight() * 3 - 10;
};
Scene_Battle.prototype.createHelpWindow = function() {
    const rect = this.helpWindowRect();
    this._helpWindow = new Window_Help(rect);
    this._helpWindow.hide();
    this._helpWindow.setBackgroundType(1); //add
    this.addWindow(this._helpWindow);
};
Scene_Battle.prototype.helpAreaHeight = function() {
    return this.calcWindowHeight(2, false);
};
Scene_Battle.prototype.helpWindowRect = function() {
    // const wx = 0;
    const wx = 10;
    const wy = this.helpAreaTop() + this.helpAreaHeight() / 3;
    const ww = Graphics.boxWidth - 20;
    const wh = this.helpAreaHeight() * 2 / 3;
    return new Rectangle(wx, wy, ww, wh);
};

Window_Help.prototype.refresh = function() {
    const rect = this.baseTextRect();
    this.contents.clear();
    // this.drawTextEx(this._text, rect.x, rect.y, rect.width);
    // 计算文本宽度
    const textWidth = this.drawTextEx(this._text, 0, this.contents.height);
    // 计算左侧边距
    const leftMargin = (rect.width - textWidth) / 2;
    // 输出文本
    this.drawTextEx(this._text,  rect.x + leftMargin, rect.y, rect.width);
};

// 行动条大小定义
Scene_Battle.prototype.createSpeedWindow = function () {
    this._speedWindow = new Window_Speed(new Rectangle(0, -4, Graphics.boxWidth, Graphics.boxHeight / 9));
    this.addWindow(this._speedWindow);
};


var old_Scene_Battle_update = Scene_Battle.prototype.update

Scene_Battle.prototype.update = function () {
    old_Scene_Battle_update.call(this)
    if (this._speedWindow) {
        this._speedWindow.refresh();
    }
}


})()