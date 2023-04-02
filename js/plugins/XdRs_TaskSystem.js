//=================================================================================================
// Task_System.js
//=================================================================================================
/*:
 * @target MZ
 * @plugindesc 任务系统。
 * @author 芯☆淡茹水
 * @help
 *
 * 〓 功能 〓
 * 
 * 1，任务的接取，完成，失败，再进行。
 * 
 * 2，任务界面显示，标签选择任务类型，任务详细信息显示。
 * 
 * 3，实时的任务追踪显示，自由选择当前追踪的任务，玩家可设置追踪窗口显示与否。
 * 
 * 4，事件（NPC）头顶显示任务相关的标志（动/静态）图片，可随时操作显示什么图片标志或者不显示。
 *    标志动态图片，依照动态帧顺序，从左到右拼接，图片命名为 名字_最大帧数 ，保存到 img/pictures 里。
 *    标志图片显示到事件头顶时，图片的 Y 坐标刚好在事件行走图像顶部，可以在该事件备注图片的 Y 值修正调整，
 *    备注方法为：事件当前页 -> 第 1 个事件项 -> 注释 -> <TrimY:ny>
 *    ny : 标志图片 Y 坐标修正值（像素值），正数往下，负数往上。
 * 
 * 
 * 〓 插件命令 〓
 * 
 *    插件命令功能            对应的脚本代码
 * 
 * 1，接取任务                $gameParty.takeTask(taskId);
 * 2，完成任务                $gameParty.completeTask(taskId);
 * 3，任务重新开始进行        $gameParty.restartTask(taskId);
 * 4，打开任务界面            SceneManager.push(Scene_Task);
 * 5，变更事件头顶的任务标志  $gameSystem.setEventSignImg(mapId, eventId, imgName);
 * 
 * 
 * 〓 脚本代码 〓
 * 
 * 1，判断某个任务是否已经接取： $gameParty.hasTask(taskId);
 *    taskId: 任务ID。
 * 
 * 2，判断某个任务是否完成： $gameParty.isTaskCompleted(taskId);
 *    taskId: 任务ID。
 * 
 * 3，判断某个任务某分支条件是否完成： $gameParty.isCompletedBranch(taskId, n1, n2, n3...);
 *    taskId: 任务ID。
 *    n1, n2, n3... : 分支条件的序号（1 ~ n），可写一个或多个，多个时所有分支条件完成时才是 true 。
 *  
 * 4，判断某个任务是否可以完成： $gameParty.canTaskComplete(taskId);
 *    taskId: 任务ID。
 * 
 * 5，随机接取一个任务： $gameParty.takeRandomTask(id1, id2, id3...);
 *    id1, id2, id3... : 任务ID，可写多个任务ID，多个时随机其中一个任务接取。
 * 
 * 6，清空杀敌数量的记录： $gameParty.clearKilledData();
 * 
 * @param routine
 * @text 〓 常规设置 〓
 * @default
 * 
 * @param menuSwitch
 * @parent routine
 * @type switch
 * @text 菜单任务选项开关
 * @desc 该开关打开时，菜单才显示任务选项，以及地图追踪窗口和
 *       设置项的追踪窗口设置。
 * @default 10
 * 
 * @param infoSwitch
 * @parent routine
 * @type switch
 * @text 信息提示开关
 * @desc 当该开关打开时，任务的 接取/完成/失败 会自动信息提示。
 * 不设置开关时，表示不启用自动信息提示功能。
 * @default 0
 * 
 * @param filterType
 * @parent routine
 * @type boolean
 * @text 标签筛选任务的方式
 * @desc 选择 开启 时，任务符合所有标签才被选中。
 *       选择 关闭 时，任务符合任一标签就被选中。
 * @default true
 * 
 * @param cancelButton
 * @parent routine
 * @type boolean
 * @text 是否生成取消按钮
 * @desc 任务界面是否生成取消按钮。
 * @default true
 * 
 * @param trackeNum
 * @parent routine
 * @type number
 * @min 1
 * @max 5
 * @text 最大任务追踪数
 * @desc 限制：最小 1 ；最大 5 。
 * @default 3
 * 
 * @param trackeKey
 * @parent routine
 * @type number
 * @text 收放快捷键
 * @desc 追踪窗口收放快捷键键盘键值(例：P 键是 80)
 * @default 80
 * 
 * @param trackeFixed
 * @parent routine
 * @type boolean
 * @text 追踪窗口是否固定
 * @desc 固定时不能点击眉框拖动。
 * @default false
 * 
 * @param takPosition
 * @parent routine
 * @text 追踪窗口初始位置
 * @desc 追踪窗口初始位置坐标（格式：x,y）。
 * @default 0,200
 * 
 * @param btnPosition
 * @parent routine
 * @text 收放按钮位置
 * @desc 追踪窗口收放按钮相对追踪窗口的位置坐标（格式：x,y）。
 * @default 290,23
 * 
 * @param taskType
 * @parent routine
 * @type text[]
 * @text 任务类型
 * @desc 任务类型名称。
 * @default ["主线","支线"]
 *
 * 
 * @param ui
 * @text 〓 窗口UI设置 〓
 * @default
 * 
 * @param uiTitle
 * @parent ui
 * @type file
 * @dir img/pictures
 * @text 标题窗口UI
 * @desc 任务界面标题窗口UI图片。
 *       窗口宽：分辨率宽 * 2 / 5 ； 窗口高：70 。
 * @default
 * 
 * @param uiLabel
 * @parent ui
 * @type file
 * @dir img/pictures
 * @text 标签窗口UI
 * @desc 任务界面标签窗口UI图片(单个)。
 *       窗口宽：58 ； 窗口高：120 。
 * @default
 * 
 * @param uiList
 * @parent ui
 * @type file
 * @dir img/pictures
 * @text 列表窗口UI
 * @desc 任务界面列表窗口UI图片。
 *       窗口宽：分辨率宽 * 2 / 5 ； 窗口高：分辨率高 - 70 。
 * @default
 * 
 * @param uiInfo
 * @parent ui
 * @type file
 * @dir img/pictures
 * @text 信息窗口UI
 * @desc 任务界面任务信息窗口UI图片。
 *       窗口宽：分辨率宽 * 3 / 5 ； 窗口高：分辨率高 - 120 。
 * @default
 * 
 * @param uiTrack
 * @parent ui
 * @type file
 * @dir img/pictures
 * @text 追踪窗口标题UI
 * @desc 任务追踪窗口标题眉框的窗口UI图片。
 *       窗口宽：320 ； 窗口高：46 。
 * @default
 * 
 * @param uiTrackList
 * @parent ui
 * @type file
 * @dir img/pictures
 * @text 追踪窗口列表UI
 * @desc 任务追踪窗口列表的窗口UI图片。
 *       窗口宽：320 ； 窗口高：最大追踪数 * 2 * 32 + 24 。
 * @default
 * 
 * @param uiTips
 * @parent ui
 * @type struct<Tips>
 * @text 信息提示窗口设置
 * @desc 自动信息提示窗口设置。
 * @default
 * 
 * 
 * @param icon
 * @text 〓 图标设置 〓
 * @default
 * 
 * @param goldIcon
 * @parent icon
 * @type number
 * @text 金钱图标序号
 * @desc 金钱图标序号。
 * @default 314
 * 
 * @param expIcon
 * @parent icon
 * @type number
 * @text 经验图标序号
 * @desc 经验图标序号。
 * @default 72
 * 
 * @param trackIcon
 * @parent icon
 * @type number
 * @text 任务追踪图标序号
 * @desc 任务已追踪图标序号。
 * @default 84
 * 
 * @param difIcon
 * @parent icon
 * @type number
 * @text 任务难度图标序号
 * @desc 任务表示难度级别图标序号。
 * @default 89
 * 
 * @param cmpIcon
 * @parent icon
 * @type number
 * @text 条件完成图标序号
 * @desc 任务分支条件完成的标志图标序号。
 * @default 78
 * 
 * @param impIcon
 * @parent icon
 * @type number
 * @text 条件未完成图标序号
 * @desc 任务分支条件未完成的标志图标序号。
 * @default 82
 * 
 * @param packIcon
 * @parent icon
 * @type number
 * @text 按钮收起样式图标序号
 * @desc 追踪窗口按钮收起样式图标序号。
 * @default 73
 * 
 * @param putIcon
 * @parent icon
 * @type number
 * @text 按钮放开样式图标序号
 * @desc 追踪窗口按钮放开样式图标序号。
 * @default 74
 * 
 * 
 * @param color
 * @text 〓 颜色设置 〓
 * @default
 * 
 * @param colorTask
 * @parent color
 * @type number
 * @text 任务文字色号
 * @desc 描绘 任务 二字的颜色序号。
 * @default 2
 * 
 * @param colorLabel
 * @parent color
 * @type number
 * @text 标签文字色号
 * @desc 任务界面标签文字颜色序号。
 * @default 11
 * 
 * @param colorType
 * @parent color
 * @type number
 * @text 任务类型文字色号
 * @desc 任务界面任务类型文字颜色序号。
 * @default 10
 * 
 * @param colorStatus
 * @parent color
 * @type number
 * @text 任务状态文字色号
 * @desc 任务界面任务状态文字颜色序号。
 * @default 23
 * 
 * @param colorActor
 * @parent color
 * @type number
 * @text 角色名字文字色号
 * @desc 角色名字文字颜色序号。
 * @default 11
 * 
 * @param colorEnemy
 * @parent color
 * @type number
 * @text 敌人名字文字色号
 * @desc 敌人名字文字颜色序号。
 * @default 2
 * 
 * @param colorItem
 * @parent color
 * @type number
 * @text 物品名字文字色号
 * @desc 物品名字文字颜色序号。
 * @default 24
 * 
 * @param colorWeapon
 * @parent color
 * @type number
 * @text 武器名字文字色号
 * @desc 武器名字文字颜色序号。
 * @default 25
 * 
 * @param colorArmor
 * @parent color
 * @type number
 * @text 防具名字文字色号
 * @desc 防具名字文字颜色序号。
 * @default 28
 * 
 * @param colorSatisfy
 * @parent color
 * @type number
 * @text 数量满足文字色号
 * @desc 数量满足（达到任务条件要求）的文字颜色序号。
 * @default 11
 * 
 * @param colorLack
 * @parent color
 * @type number
 * @text 数量不满足文字色号
 * @desc 数量不满足（未达到任务条件要求）的文字颜色序号。
 * @default 10
 * 
 * @param frameColor
 * @parent color
 * @text 矩形框的颜色
 * @desc 窗口描绘矩形框的颜色（rgb 或 html颜色）。
 * @default rgba(0,0,0,0.5)
 * 
 * 
 * @param word
 * @text 〓 用语设置 〓
 * @default
 * 
 * @param wordTask
 * @parent word
 * @text 任务用语
 * @desc 任务用语。
 * @default 任  务
 * 
 * @param wordTaskRun
 * @parent word
 * @text 任务进行中用语
 * @desc 任务进行中用语。
 * @default 进行中
 * 
 * @param wordTaskPef
 * @parent word
 * @text 任务可完成用语
 * @desc 任务可完成用语。
 * @default 可完成
 * 
 * @param wordTaskFsh
 * @parent word
 * @text 任务已完成用语
 * @desc 任务已完成用语。
 * @default 已完成
 * 
 * @param wordTaskFal
 * @parent word
 * @text 任务已失败用语
 * @desc 任务已失败用语。
 * @default 已失败
 * 
 * @param wordDft
 * @parent word
 * @text 任务难度用语
 * @desc 任务难度用语。
 * @default 难易度
 * 
 * @param wordIssuer
 * @parent word
 * @text 任务发布者用语
 * @desc 任务发布者用语。
 * @default 发布者
 * 
 * @param wordInfo
 * @parent word
 * @text 任务描述用语
 * @desc 任务描述用语。
 * @default 描述
 * 
 * @param wordCod
 * @parent word
 * @text 任务条件用语
 * @desc 任务条件用语。
 * @default 条件
 * 
 * @param wordPrize
 * @parent word
 * @text 任务奖品用语
 * @desc 任务奖品用语。
 * @default 奖品
 * 
 * @param wordStatus
 * @parent word
 * @text 任务状态显示格式
 * @desc %1:任务状态文字。
 * @default [%1]
 * 
 * @param wordType
 * @parent word
 * @text 任务类型显示格式
 * @desc %1:任务类型文字。
 * @default [%1]
 * 
 * @param wordNumA
 * @parent word
 * @text 数值数量用语
 * @desc %1:数值。
 * @default x %1
 * 
 * @param wordNumB
 * @parent word
 * @text 数值进度用语
 * @desc %1:当前数值； %2:最大数值。
 * @default %1/%2
 * 
 * @param wordActor
 * @parent word
 * @text 角色在队伍中用语
 * @desc %1:角色名字。
 * @default %1在队伍中
 * 
 * @param wordKilled
 * @parent word
 * @text 杀敌用语
 * @desc %1:敌人名字。
 * @default 击败敌人%1
 * 
 * @param wordInfo0
 * @parent word
 * @text 接取时提示用语
 * @desc 接取任务时自动信息提示的用语。
 * %1:任务名字。
 * @default 接取了任务: \c[2]%1
 * 
 * @param wordInfo1
 * @parent word
 * @text 完成时提示用语
 * @desc 完成任务时自动信息提示的用语。
 * %1:任务名字。
 * @default 完成了任务: \c[2]%1
 * 
 * @param wordInfo2
 * @parent word
 * @text 失败时提示用语
 * @desc 任务失败时自动信息提示的用语。
 * %1:任务名字。
 * @default 任务: \c[2]%1 \c[0]失败了
 * 
 * 
 * 
 * @command TakeTask
 * @text 接取任务
 * @desc 接取任务。
 * 
 * @arg id
 * @type number
 * @text 任务ID
 * @desc 任务ID。
 * @default 0
 * 
 * 
 * @command CompleteTask
 * @text 完成任务
 * @desc 完成任务。
 * 
 * @arg id
 * @type number
 * @text 任务ID
 * @desc 任务ID。
 * @default 0
 * 
 * @arg force
 * @type boolean
 * @text 是否强制完成
 * @desc 强制完成时，忽视任务的条件以及状态，完成一次任务。
 * @default false
 * 
 * 
 * @command TaskAgain
 * @text 再接任务
 * @desc 将任务的所有条件和状态归零，再次进行任务。
 * 
 * @arg id
 * @type number
 * @text 任务ID
 * @desc 任务ID。
 * @default 0
 * 
 * 
 * @command OpenTaskScene
 * @text 打开任务界面
 * @desc 打开任务界面。
 * 
 * 
 * @command ChangeTaskSign
 * @text 更改事件头顶任务标志
 * @desc 更改事件头顶任务标志。
 * 
 * @arg mapId
 * @type number
 * @text 地图ID
 * @desc 事件所在的地图ID（写 0 为当前地图）。
 * @default 0
 * 
 * @arg eventId
 * @type number
 * @text 事件ID
 * @desc 事件ID。
 * @default 0
 * 
 * @arg imgName
 * @type file
 * @dir img/pictures
 * @text 标志图片
 * @desc 标志图片。
 * @default 
 * 
*/
/*~struct~Tips:
 *
 * @param ui
 * @type file
 * @dir img/pictures/
 * @text 信息窗口ui
 * @desc 自动提示信息窗口ui图片文件。
 * @default
 * 
 * @param x
 * @type number
 * @text 窗口X坐标
 * @desc 窗口X坐标。
 * @default 228
 * 
 * @param y
 * @type number
 * @text 窗口X坐标
 * @desc 窗口X坐标。
 * @default 100
 * 
 * @param w
 * @type number
 * @text 窗口宽度
 * @desc 窗口宽度。
 * @default 360
 * 
 * @param h
 * @type number
 * @text 窗口高度
 * @desc 窗口高度。
 * @default 40
 * 
 * @param count
 * @type number
 * @text 窗口停留时间
 * @desc 窗口显示时的停留时间（帧数）。
 * @default 180
 * 
 * 
*/
//=================================================================================================
;(() => {
//=================================================================================================
$dataTasks = null;
const pluginName = 'XdRs_TaskSystem';
const parameters = PluginManager.parameters(pluginName);
//=================================================================================================
Input.keyMapper[parseInt(parameters['trackeKey'])] = 'taskTracke';
//=================================================================================================
PluginManager.registerCommand(pluginName, 'TakeTask', args => {
    $gameParty.takeTask(parseInt(args.id));
});
PluginManager.registerCommand(pluginName, 'CompleteTask', args => {
    $gameParty.completeTask(parseInt(args.id), eval(args.force));
});
PluginManager.registerCommand(pluginName, 'TaskAgain', args => {
    $gameParty.restartTask(parseInt(args.id));
});
PluginManager.registerCommand(pluginName, 'OpenTaskScene', () => {
    SceneManager.push(Scene_Task);
});
PluginManager.registerCommand(pluginName, 'ChangeTaskSign', args => {
    const mapId = parseInt(args.mapId) || $gameMap.mapId();
    $gameSystem.setEventSignImg(mapId, parseInt(args.eventId), args.imgName);
});
//=================================================================================================
function GetWindowUiName(sym) {
    return parameters['ui'+sym] || '';
};
function GetColorIndex(sym) {
    return parseInt(parameters['color'+sym]) || 0;
};
function GetColor(sym) {
    return ColorManager.textColor(GetColorIndex(sym));
};
function GetWord(sym) {
    let text = parameters['word'+sym] || '';
    for (let i=1;i<arguments.length;++i) {
        let reg = new RegExp('%'+i, 'g');
        text = text.replace(reg, arguments[i]);
    }
    return text;
};
function GetIdentifier(type, id) {
    id = id || 0;
    return ''+type+'_'+id;
};
//=================================================================================================
CanvasRenderingContext2D.prototype.setRoundRectPath = function(width, height, radius){
    this.beginPath(0); 
    this.arc(width - radius, height - radius, radius, 0, Math.PI / 2); 
    this.lineTo(radius, height);
    this.arc(radius, height - radius, radius, Math.PI / 2, Math.PI); 
    this.lineTo(0, radius);  
    this.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);  
    this.lineTo(width - radius, 0); 
    this.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);  
    this.lineTo(width, height - radius);
    this.closePath();
};
//=================================================================================================
DataManager._databaseFiles.push({ name: "$dataTasks", src: "Tasks.json" });
const XR_DataManager_loadDataFile = DataManager.loadDataFile;
DataManager.loadDataFile = function(name, src) {
    if (name === '$dataTasks') src = src.replace(/^Test_/, '');
    XR_DataManager_loadDataFile.call(this, name, src);
};
/* 没有 Tasks.json 文件时，跳过报错，再生成一个空的 $dataTasks 并储存。*/
const XR_DataManager_onXhrError = DataManager.onXhrError;
DataManager.onXhrError = function(name, src, url) {
    if (name === '$dataTasks') {
        $dataTasks = [null];
        const fs = require('fs');
        fs.writeFileSync('./data/Tasks.json', JSON.stringify($dataTasks));
    }
    else XR_DataManager_onXhrError.call(this, name, src, url);
};
//=================================================================================================
const XR_BattleManager_processVictory = BattleManager.processVictory;
BattleManager.processVictory = function() {
    this.recordKilledEnemies();
    XR_BattleManager_processVictory.call(this);
};
BattleManager.recordKilledEnemies = function() {
    $gameTroop.members().forEach(e => {
        if (e && e.isDead()) {
            $gameParty.recordEnemyKilled(e.enemyId(), 1);
        }
    });
};
//=================================================================================================
// 任务条件实例对象
//=================================================================================================
function Game_TaskCondition() {
    this.initialize(...arguments);
}
Game_TaskCondition.prototype.initialize = function(taskId, data) {
    this._taskId = taskId;
    this._data = data;
    this.recordCurrentNum();
};
Game_TaskCondition.prototype.recordCurrentNum = function() {
    this._dataNum = this.getCurrentNum();
};
/* 条件类别: 0:金钱；1:变量；2:开关；3:角色；4:杀敌；5:物品；6:武器；7:防具；8:代码 */
Game_TaskCondition.prototype.getCurrentNum = function() {
    switch(this._data.type) {
        case 0 :return $gameParty.gold();
        case 1 :return $gameVariables.value(this._data.dataId);
        case 2 :return $gameSwitches.value(this._data.dataId) ? 1 : 0;
        case 3 :return $gameParty.hasActor(this._data.dataId) ? 1 : 0;
        case 4 :return $gameParty.enemyKilledNums(this._data.dataId);
        case 5 :return $gameParty.numItems($dataItems[this._data.dataId]);
        case 6 :return $gameParty.numItems($dataWeapons[this._data.dataId]);
        case 7 :return $gameParty.numItems($dataArmors[this._data.dataId]);
        case 8 :return this.evalCode();
    }
    return 0;
};
Game_TaskCondition.prototype.evalCode = function() {
    try { return eval(this._data.code) || 0; } 
    catch (e) {
        console.error('任务条件代码书写有误，任务ID（'+this._taskId+'）');
        return 0;
    }
};
Game_TaskCondition.prototype.nowNum = function() {
    if (this._data.type !== 4) return this.getCurrentNum();
    return Math.max(0, this.getCurrentNum() - this._dataNum);
};
Game_TaskCondition.prototype.needNum = function() {
    return this._data.demand;
};
Game_TaskCondition.prototype.listText = function() {
    const id = this._data.dataId;
    const type = this._data.type;
    if ([5,6,7].contains(type)) {
        const item = type === 5 ? $dataItems[id] : (type === 6 ? $dataWeapons[id] : $dataArmors[id]);
        const n = GetColorIndex(['Item','Weapon','Armor'][type-5]);
        return '需要\\i['+item.iconIndex+']\\c['+n+']'+item.name;
    }
    switch(type) {
        case 0 :return '\\i['+parseInt(parameters['goldIcon'])+']'+TextManager.currencyUnit;
        case 1 :return $dataSystem.variables[id];
        case 2 :return $dataSystem.switches[id];
        case 3 :return GetWord('Actor', '\\c['+GetColorIndex('Actor')+']'+$gameActors.actor(id).name());
        case 4 :return GetWord('Killed', '\\c['+GetColorIndex('Enemy')+']'+$dataEnemies[id].name);
        case 8 :return this._data.text;
    }
    return '';
};
Game_TaskCondition.prototype.numText = function() {
    if ([2,3].contains(this._data.type)) return '';
    const now = Math.min(this.nowNum(), this.needNum());
    return GetWord('NumB', ''+now, ''+this.needNum());
};
Game_TaskCondition.prototype.numTextColor = function() {
    return GetColor(this.isSatisfy() ? 'Satisfy' : 'Lack');
};
/* 如果需要描绘进度条，这个是比例。*/
Game_TaskCondition.prototype.barScale = function() {
    return Math.min(1, this.nowNum() / this.needNum());
};
/* 是否满足条件 */
Game_TaskCondition.prototype.isSatisfy = function() {
    if ([2,3].contains(this._data.type)) return this.getCurrentNum() > 0;
    return this.nowNum() >= this.needNum();
};
window.Game_TaskCondition = Game_TaskCondition;
//=================================================================================================
// 任务奖品实例对象
//=================================================================================================
function Game_TaskPrize() {
    this.initialize(...arguments);
}
Game_TaskPrize.prototype.initialize = function(taskId, data) {
    this._taskId = taskId;
    this._data = data;
};
Game_TaskPrize.prototype.listText = function() {
    const id = this._data.dataId;
    const type = this._data.type;
    if ([3,4,5].contains(type)) {
        const item = type === 3 ? $dataItems[id] : (type === 4 ? $dataWeapons[id] : $dataArmors[id]);
        const n = GetColorIndex(['Item','Weapon','Armor'][type-3]);
        return '\\i['+item.iconIndex+']\\c['+n+']'+item.name;
    }
    switch(type) {
        case 0 :return '\\i['+parseInt(parameters['expIcon'])+']'+TextManager.exp;
        case 1 :return '\\i['+parseInt(parameters['goldIcon'])+']'+TextManager.currencyUnit;
        case 2 :return $dataSystem.variables[id];
        case 6 :return this._data.text;
    }
    return '';
};
Game_TaskPrize.prototype.numText = function() {
    const num = this._data.num;
    return num > 0 ? GetWord('NumA', this._data.num) : '';
};
/* 奖品类别: 0:经验；1:金钱；2:变量；3:物品；4:武器；5:防具；6:代码 */
Game_TaskPrize.prototype.gain = function() {
    const num = this._data.num, id = this._data.dataId;
    switch(this._data.type) {
        case 0 :return $gameParty.members().forEach(m => m.gainExp(num));
        case 1 :return $gameParty.gainGold(num);
        case 2 :return $gameVariables.setValue(id, $gameVariables.value(id)+num);
        case 3 :return $gameParty.gainItem($dataItems[id], num);
        case 4 :return $gameParty.gainItem($dataWeapons[id], num);
        case 5 :return $gameParty.gainItem($dataArmors[id], num);
        case 6 :
            try { eval(this._data.code); } 
            catch (e) {
                console.error('任务奖品代码书写有误，任务ID（'+this._taskId+'）');
            }
    }
};
window.Game_TaskPrize = Game_TaskPrize;
//=================================================================================================
// 任务实例对象
//=================================================================================================
function Game_Task() {
    this.initialize(...arguments);
}
Game_Task.prototype.initialize = function(id) {
    this._id = id;
    this._labelEvery = !!eval(parameters['filterType']);
    this.setup();
};
Game_Task.prototype.id = function() {
    return this._id;
};
Game_Task.prototype.data = function() {
    return $dataTasks[this._id];
};
Game_Task.prototype.setup = function() {
    this._status = 0; /* 任务状态：0:进行中；1:可完成；2:已完成；3:失败 */
    this._prizes = [];
    this._conditions = [];
    this._identifiers = [];
    this.data().prizes.forEach((d) => { this._prizes.push(new Game_TaskPrize(this._id, d)); });
    this.data().conditions.forEach((d) => { this.addCondition(d); });
};
Game_Task.prototype.evalCode = function(sym) {
    const code = this.data()[sym];
    if (code) {
        try { eval(code); } 
        catch (e) {
            const tx = type === 'failCode' ? '失败' : '完成';
            console.error('任务'+tx+'时运行的代码书写有误，任务ID（'+this._id+'）');
        }
    }
};
Game_Task.prototype.name = function() {
    return this.data().name;
};
Game_Task.prototype.type = function() {
    return this.data().type;
};
Game_Task.prototype.typeText = function() {
    return GetWord('Type',$gameTemp.taskTypes()[this.type()] || '');
};
Game_Task.prototype.status = function() {
    return this._status;
};
Game_Task.prototype.statusText = function() {
    const arr = ['Run','Pef','Fsh','Fal'].map((sym) => { return GetWord('Task'+sym); });
    return GetWord('Status', arr[this.status()] || '');
};
Game_Task.prototype.prizes = function() {
    return this._prizes;
};
Game_Task.prototype.conditions = function() {
    return this._conditions;
};
/* 如果需要描绘总进度条，这个是总比例。*/
Game_Task.prototype.barScale = function() {
    const arr = this._conditions.filter(c => c.isSatisfy());
    return Math.min(1, arr.length / this._conditions.length);
};
Game_Task.prototype.check = function(labels) {
    if (labels.length === 0) return true; /* 未选择标签时显示所有任务。*/
    return labels[this._labelEvery ? 'every' : 'some'](lab => {
        if (lab < 4) return this.status() === lab;
        return this.type() === (lab - 4);
    });
};
Game_Task.prototype.again = function() {
    this._status = 0;
    this._conditions.forEach((cod) => { cod.recordCurrentNum(); });
    this.refresh();
};
Game_Task.prototype.addCondition = function(data, refresh) {
    /* 记录任务条件的 type + dataId 为独有符号 ，各种条件变量变更时依照含有该符号的条件来刷新，避免一次所有任务全部刷新 */
    if (!this.isCompleted() && !this.isFailed()) {
        this._identifiers.push(GetIdentifier(data.type, data.dataId)); 
        this._conditions.push(new Game_TaskCondition(this._id, data));
        refresh && this.refresh();
    }
};
Game_Task.prototype.refresh = function(idSym) {
    if (!this.isCompleted() && !this.isFailed()) {
        const result = this._identifiers.contains(idSym) || idSym === void 0;
        result && $gameTemp.registerTaskRefreshIndex(this._id);
        if (this.canCompleted() && this._status === 0) {
            this._status = 1;
        }
        if (this._status === 1 && this.data().autoFinish) {
            this.complete();
        }
    }
};
Game_Task.prototype.isCompleted = function() {
    return this._status === 2;
};
Game_Task.prototype.isFailed = function() {
    return this._status === 3;
};
Game_Task.prototype.canTrack = function() {
    return !this.isCompleted() && !this.isFailed();
};
Game_Task.prototype.currentConditionData = function() {
    for (let i=0;i<this._conditions.length;++i) {
        if (!this._conditions[i].isSatisfy()) {
            let cod = this._conditions[i];
            return {'num':i+1,'cod':cod};
        }
    }
    return null;
};
Game_Task.prototype.isCompletedBranch = function() {
    return Array.prototype.every.call(arguments, index => {
        if (!this._conditions[index-1]) return true;
        return this._conditions[index-1].isSatisfy();
    });
};
Game_Task.prototype.canCompleted = function() {
    if (this.isCompleted() || this.isFailed()) return false;
    return this._conditions.every((c) => { return c.isSatisfy(); });
};
Game_Task.prototype.complete = function(force) {
    if (force || !this.isCompleted() && !this.isFailed()) {
        $gameTemp.requestTaskPromptInfo(this.name(), 1);
        this._status = 2;
        this._prizes.forEach((p) => { p.gain(); });
        this.evalCode('finishCode');
        $gameSystem.cancelTaskTracking(this._id); /* 完成时自动取消追踪 */
    }
};
Game_Task.prototype.fail = function() {
    if (!this.isCompleted() && !this.isFailed()) {
        $gameTemp.requestTaskPromptInfo(this.name(), 2);
        this._status = 3;
        this.evalCode('failCode');
        $gameSystem.cancelTaskTracking(this._id); /* 失败时自动取消追踪 */
    }
};
window.Game_Task = Game_Task;
//=================================================================================================
const XR_Game_Temp_initialize = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function() {
    XR_Game_Temp_initialize.call(this);
    this._taskNeedQueue = [];
    this._taskPromptInfos = [];
    this._taskTypes = JSON.parse(parameters['taskType']) || [];
    this._taskInfosSwitch = parseInt(parameters['infoSwitch']) || 0;
    this.setTaskNeedRefresh(false);
};
/* 用数组 index 对应记录参数设置的任务类型文字，编辑任务界面时的任务类型列表窗口可直接 $gameTemp.taskTypes() 获取。*/
Game_Temp.prototype.taskTypes = function() {
    return this._taskTypes;
};
Game_Temp.prototype.isTaskNeedRefresh = function() {
    return this._taskNeedRefresh;
};
Game_Temp.prototype.setTaskNeedRefresh = function(state) {
    this._taskNeedRefresh = state;
    if (this.isTaskNeedRefresh()) {
        this._taskNeedQueue.length = 0;
    }
};
Game_Temp.prototype.hasTaskRefreshRegister = function() {
    return this._taskNeedQueue.length > 0;
};
Game_Temp.prototype.shiftTaskRefreshIndex = function() {
    return this._taskNeedQueue.shift();
};
Game_Temp.prototype.registerTaskRefreshIndex = function(taskId) {
    const index = $gameSystem.taskTrackedIndex(taskId);
    index >= 0 && this._taskNeedQueue.push(index);
};
Game_Temp.prototype.isTaskInfosEnabled = function() {
    return this._taskInfosSwitch > 0;
};
Game_Temp.prototype.isTaskInfosVisibility = function() {
    return this.isTaskInfosEnabled() && $gameSwitches.value(this._taskInfosSwitch);
};
Game_Temp.prototype.requestTaskPromptInfo = function(taskName, type) {
    if (this.isTaskInfosVisibility()) {
        const text = GetWord('Info'+type, taskName);
        this._taskPromptInfos.push(text);
    }
};
Game_Temp.prototype.hasTaskPromptInfo = function() {
    return this._taskPromptInfos.length > 0;
};
Game_Temp.prototype.taskShiftPromptInfo = function() {
    return this._taskPromptInfos.shift();
};
//=================================================================================================
const XR_Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    XR_Game_System_initialize.call(this);
    this._eventsSignData = {};
    const arr = parameters['takPosition'].split(',');
    const x = parseInt(arr[0]) || 0;
    const y = parseInt(arr[1]) || 0;
    this._taskSwitchId = parseInt(parameters['menuSwitch']) || 0;
    /* 追踪窗口初始数据（追踪的任务，坐标，收放状态，是否显示）*/
    this._trackeData = {'tasks':[],'x':x,'y':y,'show':true,'visibility':false};
};
Game_System.prototype.isTaskEnabled = function() {
    return $gameSwitches.value(this._taskSwitchId);
};
Game_System.prototype.trackedTasks = function() {
    return this._trackeData.tasks;
};
Game_System.prototype.taskTrackedIndex = function(taskId) {
    return this._trackeData.tasks.indexOf(taskId);
};
Game_System.prototype.isTaskTracked = function(taskId) {
    return this.taskTrackedIndex(taskId) >= 0;
};
Game_System.prototype.trackTask = function(taskId, type) {
    if (type === 0) {
        if (!this._trackeData.tasks.contains(taskId)) {
            this._trackeData.tasks.push(taskId);
            const max = parseInt(parameters['trackeNum']) || 3;
            while(this._trackeData.tasks.length > max) {
                this._trackeData.tasks.unshift();
            }
        }
    } else this._trackeData.tasks.remove(taskId);
    $gameTemp.setTaskNeedRefresh(true);
};
Game_System.prototype.cancelTaskTracking = function(taskId) {
    if (this._trackeData.tasks.contains(taskId)) {
        this._trackeData.tasks.remove(taskId);
        $gameTemp.setTaskNeedRefresh(true);
    }
};
Game_System.prototype.isTrackeWindowShow = function() {
    return this._trackeData.show;
};
Game_System.prototype.trackeWindowVisibility = function() {
    return this.isTaskEnabled() && this._trackeData.visibility;
};
Game_System.prototype.trackeWindowPosition = function() {
    return new Point(this._trackeData.x, this._trackeData.y);
};
Game_System.prototype.setTrackeWindowState = function(sym, state) {
    this._trackeData[sym] = state;
};
Game_System.prototype.setTrackeWindowPosition = function(x, y) {
    this._trackeData.x = x;
    this._trackeData.y = y;
};
Game_System.prototype.eventSignImg = function(id) {
    return this._eventsSignData[id];
};
Game_System.prototype.setEventSignImg = function(mapId, eventId, imgName) {
    const id = ''+mapId+'_'+eventId;
    if (!imgName) delete this._eventsSignData[id];
    else this._eventsSignData[id] = imgName;
};
Game_System.prototype.clearEventSign = function(mapId, eventId) {
    const id = ''+mapId+'_'+eventId;
    delete this._eventsSignData[id];
};
//=================================================================================================
const XR_Game_Switches_setValue = Game_Switches.prototype.setValue;
Game_Switches.prototype.setValue = function(switchId, value) {
    const tmp = this.value(switchId);
    XR_Game_Switches_setValue.call(this, switchId, value);
    tmp !== this.value(switchId) && $gameParty.refreshTasks(GetIdentifier(2, switchId));
};
//=================================================================================================
const XR_Game_Variables_setValue = Game_Variables.prototype.setValue;
Game_Variables.prototype.setValue = function(variableId, value) {
    const tmp = this.value(variableId);
    XR_Game_Variables_setValue.call(this, variableId, value);
    tmp !== this.value(variableId) && $gameParty.refreshTasks(GetIdentifier(1, variableId));
};
//=================================================================================================
const XR_Game_Party_initAllItems = Game_Party.prototype.initAllItems;
Game_Party.prototype.initAllItems = function() {
    XR_Game_Party_initAllItems.call(this);
    this._tasks = [];
    this.clearKilledData();
};
Game_Party.prototype.clearKilledData = function() {
    this._enemyKilledData = {};
};
Game_Party.prototype.hasActor = function(actorId) {
    return this._actors.contains(actorId);
};
const XR_Game_Party_addActor = Game_Party.prototype.addActor;
Game_Party.prototype.addActor = function(actorId) {
    const tmp = this.hasActor(actorId);
    XR_Game_Party_addActor.call(this, actorId);
    tmp !== this.hasActor(actorId) && this.refreshTasks(GetIdentifier(3, actorId));
};
const XR_Game_Party_gainGold = Game_Party.prototype.gainGold;
Game_Party.prototype.gainGold = function(amount) {
    const tmp = this.gold();
    XR_Game_Party_gainGold.call(this, amount);
    tmp !== this.gold(amount) && this.refreshTasks(GetIdentifier(0, 0));
};
const XR_Game_Party_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
    const tmp = this.numItems(item);
    XR_Game_Party_gainItem.call(this, item, amount, includeEquip);
    if (tmp !== this.numItems(item)) {
        const n = DataManager.isItem(item) ? 5 : (DataManager.isWeapon(item) ? 6 : 7);
        this.refreshTasks(GetIdentifier(n, item.id));
    }
};
Game_Party.prototype.enemyKilledNums = function(enemyId) {
    return this._enemyKilledData[enemyId] || 0;
}; 
Game_Party.prototype.recordEnemyKilled = function(enemyId, num) {
    this._enemyKilledData[enemyId] = Math.max(0, num + this.enemyKilledNums(enemyId));
    this.refreshTasks(GetIdentifier(4, enemyId));
};
Game_Party.prototype.task = function(taskId) {
    return this._tasks.find((task) => { return task.id() === taskId; });
};
Game_Party.prototype.tasks = function() {
    return this._tasks;
};
Game_Party.prototype.tasksBy = function(labels) {
    return this._tasks.filter((t) => { return t.check(labels); });
};
Game_Party.prototype.hasTask = function(taskId) {
    return this._tasks.some((task) => { return task.id() === taskId; });
};
Game_Party.prototype.takeTask = function() {
    Array.prototype.forEach.call(arguments, id => {
        if ($dataTasks[id] && !this.hasTask(id)) {
            const task = new Game_Task(id);
            this._tasks.push(task);
            $gameTemp.requestTaskPromptInfo(task.name(), 0);
        }
    });
};
Game_Party.prototype.takeRandomTask = function() {
    const arr = Array.prototype.filter.call(arguments, id => !this.hasTask(id));
    const index = Math.randomInt(arr.length);
    this.takeTask(arr[index]);
};
Game_Party.prototype.addTaskCondition = function(taskId, data) {
    const task = this.task(taskId);
    if (task) {
        task.addCondition(data, true);
        task.refresh();
    }
};
Game_Party.prototype.isCompletedBranch = function(taskId) {
    if (!this.hasTask(taskId)) return false;
    const task = this.task(taskId);
    const arr = Array.prototype.slice.call(arguments, 1);
    return task.isCompletedBranch(...arr);
};
Game_Party.prototype.isTaskCompleted = function(taskId) {
    return this.hasTask(taskId) && this.task(taskId).isCompleted();
};
Game_Party.prototype.canTaskComplete = function(taskId) {
    return this.hasTask(taskId) && this.task(taskId).canCompleted();
};
Game_Party.prototype.completeTask = function(taskId, force) {
    this.hasTask(taskId) && this.task(taskId).complete(force);
};
Game_Party.prototype.restartTask = function(taskId) {
    if (this.hasTask(taskId)) {
        this.task(taskId).again();
        $gameTemp.requestTaskPromptInfo(this.task(taskId).name(), 0);
    }
};
Game_Party.prototype.refreshTasks = function(idSym) {
    for (let task of this._tasks) {
        task.refresh(idSym);
    }
};
//=================================================================================================
Game_Event.prototype.taskSignId = function() {
    return ''+this._mapId+'_'+this._eventId;
};
Game_Event.prototype.taskSignTrimY = function() {
    return this._taskSignTrimY || 0;
};
const XR_Game_Event_setupPage = Game_Event.prototype.setupPage;
Game_Event.prototype.setupPage = function() {
    XR_Game_Event_setupPage.call(this);
    this.setupTaskSignTrimY();
};
Game_Event.prototype.setupTaskSignTrimY = function() {
    this._taskSignTrimY = 0;
    if (this.page() && this.list() && this.list()[0].code === 108) {
        if (this.list()[0].parameters[0].match(/<TrimY:(\S+)>/)) {
            this._taskSignTrimY = eval(RegExp.$1);
        }
    }
};
//=================================================================================================
// 事件头顶任务标志
//=================================================================================================
function Sprite_TaskSign() {
    this.initialize(...arguments);
}
Sprite_TaskSign.prototype = Object.create(Sprite.prototype);
Sprite_TaskSign.prototype.constructor = Sprite_TaskSign;
Sprite_TaskSign.prototype.initialize = function(event) {
    Sprite.prototype.initialize.call(this);
    this._event = event;
    this.anchor = new Point(0.5, 1);
    this._id = event.taskSignId();
    this.setCharacterHeight(0);
    this._speed = 10;
    this.setup();
};
Sprite_TaskSign.prototype.setup = function() {
    this._imgName = $gameSystem.eventSignImg(this._id);
    this._actionCount = 0;
    this._maxFrame = 1;
    if (this._imgName) {
        this._maxFrame = parseInt(this._imgName.split('_')[1]) || 1;
    }
    this.bitmap = this._imgName ? ImageManager.loadPicture(this._imgName) : null;
    if (this.bitmap) {
        this.bitmap.addLoadListener(this.refreshAction.bind(this));
    }
};
Sprite_TaskSign.prototype.setCharacterHeight = function(height) {
    this._characterHeight = height;
    this.refreshPositionY();
};
Sprite_TaskSign.prototype.refreshPositionY = function() {
    this._trimY = this._event.taskSignTrimY();
    this.y = -this._characterHeight + this._trimY;
};
Sprite_TaskSign.prototype.refreshAction = function() {
    const fw = this.bitmap.width / this._maxFrame;
    const sx = Math.floor(this._actionCount / this._speed) * fw;
    this.setFrame(sx, 0 , fw, this.bitmap.height);
};
Sprite_TaskSign.prototype.isImgChanged = function() {
    return this._imgName !== $gameSystem.eventSignImg(this._id);
};
Sprite_TaskSign.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateBitmap();
    this.updateAction();
};
Sprite_TaskSign.prototype.updateBitmap = function() {
    this.isImgChanged() && this.setup();
    if (this._trimY !== this._event.taskSignTrimY()) {
        this.refreshPositionY();
    }
};
Sprite_TaskSign.prototype.updateAction = function() {
    if (this._maxFrame > 1 && this.bitmap && this.bitmap.isReady()) {
        const maxCount = this._speed * this._maxFrame;
        this._actionCount = (this._actionCount+1) % maxCount;
        if ((this._actionCount % this._speed) === 0) {
            this.refreshAction();
        }
    }
};
//=================================================================================================
// 追踪窗口按钮
//=================================================================================================
function Sprite_TrackButton() {
    this.initialize(...arguments);
}
Sprite_TrackButton.prototype = Object.create(Sprite_Clickable.prototype);
Sprite_TrackButton.prototype.constructor = Sprite_TrackButton;
Sprite_TrackButton.prototype.initialize = function() {
    Sprite_Clickable.prototype.initialize.call(this);
    this.bitmap = ImageManager.loadSystem('IconSet');
    const arr = parameters['btnPosition'].split(',').map(n => parseInt(n));
    this.anchor = new Point(0.5, 0.5);
    this._pressCount = 0;
    this.refreshStyle();
    this.move(arr[0] || 0, arr[1] || 0);
};
Sprite_TrackButton.prototype.refreshStyle = function() {
    this._state = $gameSystem.isTrackeWindowShow();
    const index = parseInt(parameters[this._state ? 'packIcon' : 'putIcon']) || 0;
    const pw = ImageManager.iconWidth;
    const ph = ImageManager.iconHeight;
    const sx = (index % 16) * pw;
    const sy = Math.floor(index / 16) * ph;
    this.setFrame(sx, sy, pw, ph);
};
Sprite_TrackButton.prototype.onPress = function() {
    if (this._pressCount === 0 && !this.parent.isInAction()) {
        SoundManager.playOk();
        this.parent.startAction();
        this.scale = new Point(0.95, 0.95);
        this._pressCount = 8;
    }
};
Sprite_TrackButton.prototype.update = function() {
    Sprite_Clickable.prototype.update.call(this);
    this.updateStyle();
    this.updatePressed();
};
Sprite_TrackButton.prototype.updateStyle = function() {
    if (this._state !== $gameSystem.isTrackeWindowShow()) {
        this.refreshStyle();
    }
};
Sprite_TrackButton.prototype.updatePressed = function() {
    if (this._pressCount > 0) {
        this._pressCount--;
        if (this._pressCount === 0) {
            this.scale = new Point(1, 1);
        }
    }
};
//=================================================================================================
const XR_Sprite_Character_initialize = Sprite_Character.prototype.initialize;
Sprite_Character.prototype.initialize = function(character) {
    XR_Sprite_Character_initialize.call(this, character);
    this.createTaskSign();
};
Sprite_Character.prototype.createTaskSign = function() {
    if (this._character instanceof Game_Event) {
        this._taskSign = new Sprite_TaskSign(this._character);
        this.addChild(this._taskSign);
    }
};
const XR_Sprite_Character_updateBitmap = Sprite_Character.prototype.updateBitmap;
Sprite_Character.prototype.updateBitmap = function() {
    const result = this.isImageChanged();
    XR_Sprite_Character_updateBitmap.call(this);
    result && this.setTaskSignHeight();
};
Sprite_Character.prototype.setTaskSignHeight = function() {
    if (this._taskSign) {
        this.bitmap.addLoadListener(() => {
            const height = this.patternHeight();
            this._taskSign.setCharacterHeight(height)
        });
    }
};
//=================================================================================================
Window_Base.prototype.maxExWidth = function() {
    return 0;
};
Window_Base.prototype.limitIconSize = function() {
    return 0;
};
Window_Base.prototype.setupUiSprite = function(uiName) {
    if (uiName) {
        this.opacity = 0;
        this._uiSprite = new Sprite(ImageManager.loadPicture(uiName));
        this._uiSprite.bitmap.addLoadListener(this.onUiImageLoad.bind(this));
        this.addChildToBack(this._uiSprite);
    }
};
Window_Base.prototype.onUiImageLoad = function() {
    this._uiSprite.scale.x = this.width / this._uiSprite.bitmap.width;
    this._uiSprite.scale.y = this.height / this._uiSprite.bitmap.height;
};
const XR_Window_Base_processCharacter = Window_Base.prototype.processCharacter;
Window_Base.prototype.processCharacter = function(textState) {
    if (this.maxExWidth() === 0) XR_Window_Base_processCharacter.call(this, textState);
    else {
        const c = textState.text[textState.index+1];
        if (c && c.charCodeAt(0) >= 0x20) {
            textState.dataX = textState.dataX || textState.startX;
            const cw = this.textWidth(c);
            const mw = this.maxExWidth() || this.contents.width;;
            if ((textState.dataX + cw) >= mw) {
                this.flushTextState(textState);
                this.processNewLine(textState);
            }
            textState.dataX += cw;
        }
        XR_Window_Base_processCharacter.call(this, textState);
    }
};
const XR_Window_Base_processNewLine = Window_Base.prototype.processNewLine;
Window_Base.prototype.processNewLine = function(textState) {
    textState.dataX = textState.startX;
    XR_Window_Base_processNewLine.call(this, textState);
};
Window_Base.prototype.drawRoundRect = function(x, y, width, height, radius, lineWidth, strokeColor, fillColor) {         
    if (2 * radius > width || 2 * radius > height) return;
    const context = this.contents._context;
    context.save();
    context.translate(x, y); 
    context.setRoundRectPath(width, height, radius);
    context.lineWidth = lineWidth;
    if (strokeColor) {
        context.strokeStyle = strokeColor;
        context.stroke();
    }
    if (fillColor) {
        context.fillStyle = fillColor;
        context.fill();
    }
    context.restore();
};
Window_Base.prototype.drawTaskStatus = function(task, x, y) {
    if (task) {
        const tw = this.textWidth(task.typeText()+' ');
        const sw = this.textWidth(task.statusText());
        this.changeTextColor(GetColor('Type'));
        this.drawText(task.typeText(), x, y, tw);
        this.changeTextColor(GetColor('Status'));
        this.drawText(task.statusText(), x+tw, y, sw);
    } 
};
const XR_Window_Base_drawIcon = Window_Base.prototype.drawIcon;
Window_Base.prototype.drawIcon = function(iconIndex, x, y) {
    const size = this.limitIconSize();
    if (!size) XR_Window_Base_drawIcon.call(this, iconIndex, x, y);
    else {
        const bitmap = ImageManager.loadSystem("IconSet");
        const pw = ImageManager.iconWidth;
        const ph = ImageManager.iconHeight;
        const sx = (iconIndex % 16) * pw;
        const sy = Math.floor(iconIndex / 16) * ph;
        this.contents.blt(bitmap, sx, sy, pw, ph, x, y, size, size);
    }
};
Window_Base.prototype.processDrawIcon = function(iconIndex, textState) {
    if (textState.drawing) {
        this.drawIcon(iconIndex, textState.x + 2, textState.y + 2);
    }
    textState.x += (this.limitIconSize() || ImageManager.iconWidth) + 4;
};
//=================================================================================================
// 任务界面标题窗口
//=================================================================================================
function Window_TaskTitle() {
    this.initialize(...arguments);
}
Window_TaskTitle.prototype = Object.create(Window_Base.prototype);
Window_TaskTitle.prototype.constructor = Window_TaskTitle;
Window_TaskTitle.prototype.initialize = function() {
    const width = Graphics.boxWidth * 2 / 5;
    const rect = new Rectangle(0, 0, width, 70);
    Window_Base.prototype.initialize.call(this, rect);
    this.setupUiSprite(GetWindowUiName('Title'));
    this.drawTitleText();
};
Window_TaskTitle.prototype.lineHeight = function() {
    return this.contentsHeight();
};
Window_TaskTitle.prototype.drawTitleText = function() {
    /* 使用UI图片时不描绘任务用语文字 */
    if (!this._uiSprite) {
        this.contents.fontBold = true;
        this.contents.fontSize = 30;
        this.changeTextColor(GetColor('Task'));
        this.drawText(GetWord('Task'), 0, 0, this.contents.width, 'center');
    }
};
//=================================================================================================
// 任务界面标签子窗口
//=================================================================================================
function Window_TaskLabelItem() {
    this.initialize(...arguments);
}
Window_TaskLabelItem.prototype = Object.create(Window_Base.prototype);
Window_TaskLabelItem.prototype.constructor = Window_TaskLabelItem;
Window_TaskLabelItem.prototype.initialize = function(index, text) {
    this._index = index;
    const x = index * 58;
    const y = index === 0 ? 0 : -24;
    const rect = new Rectangle(x, y, 58, 120);
    Window_Base.prototype.initialize.call(this, rect);
    this.setupUiSprite(GetWindowUiName('Label'));
    this.drawLabelText(text);
};
Window_TaskLabelItem.prototype.drawLabelText = function(text) {
    const arr = text.split('');
    const size = this.contents.fontSize;
    const y = (this.contents.height - arr.length * size) / 2;
    this.changeTextColor(GetColor('Label'));
    for (let i=0;i<arr.length;++i) {
        this.drawText(arr[i], 0, y + size * i, this.contents.width, 'center');
    }
};
Window_TaskLabelItem.prototype.refreshCursor = function(index) {
    const w = this._index === index ? this.contents.width : 0;
    const h = this._index === index ? this.contents.height : 0;
    this.setCursorRect(0, 0, w, h);
};
Window_TaskLabelItem.prototype.isInPlace = function() {
    if (!this.parent) return true;
    if (this.parent.isRegistered(this._index-1)) return this.y >= 0;
    return this.y <= -24;
};
Window_TaskLabelItem.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    this.updateMove();
};
Window_TaskLabelItem.prototype.updateMove = function() {
    if (this._index > 0 && !this.isInPlace()) {
        const result = this.parent.isRegistered(this._index-1);
        this.y += result ? 3 : -3;
        if (this.isInPlace()) this.y = result ? 0 : -24;
    }
};
//=================================================================================================
// 任务界面标签窗口
//=================================================================================================
function Window_TaskLabel() {
    this.initialize(...arguments);
}
Window_TaskLabel.prototype = Object.create(Window_Selectable.prototype);
Window_TaskLabel.prototype.constructor = Window_TaskLabel;
Window_TaskLabel.prototype.initialize = function() {
    const x = Graphics.boxWidth * 2 / 5;
    const width = Graphics.boxWidth - x;
    const rect = new Rectangle(x, 0, width, 120);
    Window_Selectable.prototype.initialize.call(this, rect);
    this.opacity = 0;
    this.createParts();
    this.activate();
    this.select(0);
};
Window_TaskLabel.prototype.labels = function() {
    return this._labels;
};
Window_TaskLabel.prototype.createParts = function() {
    this._labels = [];
    this._parts = [];
    const status = ['Run','Pef','Fsh','Fal'].map(sym => GetWord('Task'+sym));
    const arr = ['确定'].concat(status, $gameTemp.taskTypes());
    for (let i=0;i<arr.length;++i) {
        this._parts[i] = new Window_TaskLabelItem(i, arr[i]);
        this.addChild(this._parts[i]);
    }
    this.refreshCursor();
};
Window_TaskLabel.prototype.registerLabel = function(label, type) {
    const tmp = this.isRegistered(label);
    this._labels[type === 0 ? 'push' : 'remove'](label);
    if (tmp !== this.isRegistered(label)) {
        this.callHandler('label');
    }
};
Window_TaskLabel.prototype.isRegistered = function(label) {
    return this._labels.contains(label);
};
Window_TaskLabel.prototype.maxCols = function() {
    return this._parts ? this._parts.length : 1;
};
Window_TaskLabel.prototype.maxItems = function() {
    return this._parts ? this._parts.length : 1;
};
Window_TaskLabel.prototype.itemRect = function(index) {
    const w = this._parts[0].width;
    const h = this._parts[0].height;
    return new Rectangle(index * w, 0, w, h);
};
Window_TaskLabel.prototype.refreshCursor = function() {
    this.setCursorRect(0, 0, 0, 0);
    if (this._parts) {
        this._parts.forEach(p => p.refreshCursor(this._index));
    }
};
Window_TaskLabel.prototype.isOkEnabled = function() {
    return true;
};
Window_TaskLabel.prototype.processOk = function() {
    this.playOkSound();
    if (this._index === 0) {
        this.deactivate();
        this.callOkHandler();
    } else {
        const label = this._index - 1;
        const type = this.isRegistered(label) ? 1 : 0;
        this.registerLabel(label, type);
    }
};
//=================================================================================================
// 任务界面任务列表窗口
//=================================================================================================
function Window_TaskList() {
    this.initialize(...arguments);
}
Window_TaskList.prototype = Object.create(Window_Selectable.prototype);
Window_TaskList.prototype.constructor = Window_TaskList;
Window_TaskList.prototype.initialize = function() {
    this._data = [];
    this._waitCount = 0;
    this._dataLabels = [];
    const width = Graphics.boxWidth * 2 / 5;
    const height = Graphics.boxHeight - 70;
    const rect = new Rectangle(0, 70, width, height);
    Window_Selectable.prototype.initialize.call(this, rect);
    this.setupUiSprite(GetWindowUiName('List'));
    this.refresh();
};
Window_TaskList.prototype.activate = function() {
    Window_Selectable.prototype.activate.call(this);
    this._waitCount = 10;
};
Window_TaskList.prototype.onLabelsChange = function(labels) {
    this._dataLabels = labels;
    this.refresh();
};
Window_TaskList.prototype.maxItems = function() {
    return this._data.length;
};
Window_TaskList.prototype.item = function() {
    return this.itemAt(this.index());
};
Window_TaskList.prototype.itemAt = function(index) {
    return index >= 0 ? this._data[index] : null;
};
Window_TaskList.prototype.isCurrentItemEnabled = function() {
    return this.isEnabled(this.item());
};
Window_TaskList.prototype.isEnabled = function(item) {
    return !item.isFailed();
};
Window_TaskList.prototype.makeItemList = function() {
    this._data = $gameParty.tasksBy(this._dataLabels);
    if (this._data.length === 0) {
        this._data.push(null);
    }
};
Window_TaskList.prototype.refresh = function() {
    this.makeItemList();
    Window_Selectable.prototype.refresh.call(this);
};
Window_TaskList.prototype.drawItem = function(index) {
    const item = this.itemAt(index);
    const rect = this.itemLineRect(index);
    if (item) {
        this.changePaintOpacity(this.isEnabled(item));
        this.drawText(item.name(), rect.x, rect.y, rect.width);
        if ($gameSystem.isTaskTracked(item.id())) {
            const iconIndex = parseInt(parameters['trackIcon']);
            if (!!iconIndex) {
                const pw = ImageManager.iconWidth;
                const y = rect.y + (this.lineHeight() - pw) / 2;
                this.drawIcon(iconIndex, rect.width - pw / 2 - 4, y);
            }
        }
    } else {
        this.resetTextColor();
        this.drawText('空', rect.x, rect.y, rect.width, 'center');
    }
};
Window_TaskList.prototype.callUpdateHelp = function() {
    this.callHandler('info');
    Window_Selectable.prototype.callUpdateHelp.call(this);
};
Window_TaskList.prototype.isOkEnabled = function() {
    return !this._waitCount && this.item() && this.item().canTrack();
};
Window_TaskList.prototype.processOk = function() {
    this.playOkSound();
    const task = this.item();
    const type = $gameSystem.isTaskTracked(task.id()) ? 1 : 0;
    $gameSystem.trackTask(task.id(), type);
    this.redrawCurrentItem();
};
Window_TaskList.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    if (this._waitCount > 0) this._waitCount--;
};
//=================================================================================================
// 任务界面任务信息窗口
//=================================================================================================
function Window_TaskInfo() {
    this.initialize(...arguments);
}
Window_TaskInfo.prototype = Object.create(Window_Base.prototype);
Window_TaskInfo.prototype.constructor = Window_TaskInfo;
Window_TaskInfo.prototype.initialize = function() {
    const x = Graphics.boxWidth * 2 / 5;
    const width = Graphics.boxWidth - x;
    const height = Graphics.boxHeight - 120;
    const rect = new Rectangle(x, 120, width, height);
    Window_Base.prototype.initialize.call(this, rect);
    this.setupUiSprite(GetWindowUiName('Info'));
    this.setupAreaData();
    this.refresh();
};
Window_TaskInfo.prototype.maxExWidth = function() {
    return this.contents.width - 24;
};
Window_TaskInfo.prototype.limitIconSize = function() {
    return this.contents.fontSize + 6;
};
Window_TaskInfo.prototype.setupAreaData = function() {
    this._areaData = [];
    const h = this.contents.height;
    const lh = this.lineHeight();
    const maxLine = Math.floor(h / lh);
    const frameHeight = Math.floor((maxLine - 5) * lh / 3);
    this._areaData[0] = lh * 3 + 2;
    this._areaData[1] = lh * 4 + frameHeight + 2;
    this._areaData[2] = lh * 5 + frameHeight * 2 + 2;
};
Window_TaskInfo.prototype.resetFontSettings = function() {
    Window_Base.prototype.resetFontSettings.call(this);
    this.contents.fontSize = 20;
};
Window_TaskInfo.prototype.refresh = function() {
    this.contents.clear();
    this.drawStyle();
    this.drawCurrentTask();
};
Window_TaskInfo.prototype.drawStyle = function() {
    /* 使用UI图片时不描绘系统文字和方框 */
    if (!this._uiSprite) {
        const ox = 8;
        const w = this.contents.width;
        const h = this.contents.height;
        const lh = this.lineHeight();
        const maxLine = Math.floor(h / lh);
        const frameHeight = Math.floor((maxLine - 5) * lh / 3);
        const frameColor = parameters['frameColor'];
        this.changeTextColor(this.systemColor());
        for (let i=0;i<4;++i) {
            let x = i % 2 * (w / 2) + (!(i%2) ? 0 : 4), y = Math.floor(i / 2) * lh + 2;
            this.drawRoundRect(x, y, w / 2 - 4, lh-4, 5, 0, '', frameColor);
        }
        this.drawRoundRect(0, this._areaData[0], w, frameHeight - 4, 5, 0, '', frameColor);
        this.drawRoundRect(0, this._areaData[1], w, frameHeight - 4, 5, 0, '', frameColor);
        this.drawRoundRect(0, this._areaData[2], w, frameHeight - 4, 5, 0, '', frameColor);
        if (this._currentTask) {
            this.drawText(GetWord('Dft'), ox, lh, w/2);
            this.drawText(GetWord('Issuer'), ox + w / 2, lh, w/2);
            for (let i=0;i<3;++i) {
                let sym = ['Info','Cod','Prize'][i];
                this.drawText(GetWord(sym), ox, this._areaData[i] - lh, w);
            }
        }
    }
};
Window_TaskInfo.prototype.drawCurrentTask = function() {
    this.resetTextColor();
    const task = this._currentTask;
    if (task) {
        let x = 0, y = 0;
        const ox = 8;
        const w = this.contents.width;
        const lh = this.lineHeight();
        this.drawText(task.name(), ox, 0, w);
        this.drawTaskStatus(task, w/2+8, 0);
        x = ox + this.textWidth(GetWord('Issuer')) + w / 2 + 12;
        this.drawTextEx(task.data().issuer, x, lh * 1 + 4);
        const pw = ImageManager.iconWidth;
        const size = this.limitIconSize();
        const tw = this.textWidth(GetWord('Dft'));
        const iconIndex = parseInt(parameters['difIcon']);
        y = (lh - pw) / 2 + lh;
        for (let i=0;i<task.data().difficulty;++i) {
            this.drawIcon(iconIndex, (size + 2) * i + tw + 4 + ox, y + (pw - size) / 2);
        }
        this.drawTextEx(task.data().introduce, ox, this._areaData[0]+2);
        this.drawTaskConditions(ox);
        this.drawTaskPrizes(ox);
    }
};
Window_TaskInfo.prototype.drawTaskConditions = function(x) {
    const lh = this.contents.fontSize + 8;
    const arr = this._currentTask.conditions();
    const size = this.limitIconSize();
    for (let i=0;i<arr.length;++i) {
        let cod = arr[i];
        let y = this._areaData[1] + lh * i + 2;
        let text = ''+(i+1)+': ' + cod.listText();
        let text2 = cod.numText();
        let tw = this.textWidth(text2);
        let icon = parseInt(parameters[(cod.isSatisfy() ? 'cmp' : 'imp')+'Icon']) || 0;
        icon > 0 && this.drawIcon(icon, x, y);
        this.drawTextEx(text, x+size+8, y);
        this.changeTextColor(cod.numTextColor());
        this.drawText(cod.numText(), this.contents.width - tw - 8, y, tw);
    }
};
Window_TaskInfo.prototype.drawTaskPrizes = function(x) {
    const lh = this.contents.fontSize + 8;
    const arr = this._currentTask.prizes();
    for (let i=0;i<arr.length;++i) {
        let prz = arr[i];
        let y = this._areaData[2] + lh * i + 2;
        let text = ''+(i+1)+': ' + prz.listText();
        let text2 = prz.numText();
        let tw = this.textWidth(text2);
        this.drawTextEx(text, x, y);
        this.resetTextColor();
        this.drawText(prz.numText(), this.contents.width - tw - 8, y, tw);
    }
};
Window_TaskInfo.prototype.setCurrentTask = function(task) {
    if (this._currentTask !== task) {
        this._currentTask = task;
        this.refresh();
    }
};
//=================================================================================================
// 追踪窗口标题
//=================================================================================================
function Window_TaskTracke() {
    this.initialize(...arguments);
}
Window_TaskTracke.prototype = Object.create(Window_Base.prototype);
Window_TaskTracke.prototype.constructor = Window_TaskTracke;
Window_TaskTracke.prototype.initialize = function() {
    const p = $gameSystem.trackeWindowPosition();
    const rect = new Rectangle(p.x, p.y, 320, 46);
    this._isFixed = !!(eval(parameters['trackeFixed']));
    Window_Base.prototype.initialize.call(this, rect);
    this.setupUiSprite(GetWindowUiName('Track'));
    this.createTaskWindow();
    this.createOperateButton();
    this.drawTitleText();
};
Window_TaskTracke.prototype.lineHeight = function() {
    return this.contentsHeight();
};
Window_TaskTracke.prototype.createTaskWindow = function() {
    this._task = new Window_TrackeList();
    this.addChildToBack(this._task);
};
Window_TaskTracke.prototype.createOperateButton = function() {
    this._button = new Sprite_TrackButton();
    this.addChild(this._button);
};
Window_TaskTracke.prototype.drawTitleText = function() {
    /* 使用UI图片窗口时，不描绘任务用语文字 */
    if (!this._uiSprite) {
        this.contents.fontBold = true;
        this.contents.fontSize = 20;
        this.changeTextColor(GetColor('Task'));
        this.drawText(GetWord('Task'), 0, 0, this.contents.width, 'center');
    }
};
Window_TaskTracke.prototype.isHovered = function(excludeBtn) {
    if (!this.visible) return false;
    if (this._button._hovered) return !excludeBtn;
    return !this._isFixed && Window_Scrollable.prototype.isTouchedInsideFrame.call(this);
};
Window_TaskTracke.prototype.isInAction = function() {
    return this._task.isInAction();
};
Window_TaskTracke.prototype.startAction = function() {
    this._task.startAction();
};
Window_TaskTracke.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    this.updateVisibility();
    if (this.visible && !this._isFixed) {
        this.updateTouchMove();
    }
};
Window_TaskTracke.prototype.updateVisibility = function() {
    this.visible = $gameSystem.trackeWindowVisibility();
};
Window_TaskTracke.prototype.updateTouchMove = function() {
    if (this._touchPoint) {
        if (TouchInput.isPressed()) {
            const x = TouchInput.x - this._touchPoint.x;
            const y = TouchInput.y - this._touchPoint.y;
            this.x = Math.max(0, Math.min(Graphics.boxWidth - this.width, x));
            this.y = Math.max(0, Math.min(Graphics.boxHeight - this.height, y));
        } else {
            $gameSystem.setTrackeWindowPosition(this.x, this.y);
            this._touchPoint = null;
        }
    } else {
        if (TouchInput.isTriggered() && this.isHovered(true)) {
            this._touchPoint = new Point(TouchInput.x - this.x, TouchInput.y - this.y);
        }
    }
};
//=================================================================================================
// 追踪窗口任务列表
//=================================================================================================
function Window_TrackeList() {
    this.initialize(...arguments);
}
Window_TrackeList.prototype = Object.create(Window_Base.prototype);
Window_TrackeList.prototype.constructor = Window_TrackeList;
Window_TrackeList.prototype.initialize = function() {
    this._nums = parseInt(parameters['trackeNum']) || 3;
    const h = this.lineHeight() * this._nums * 2 + 24;
    const rect = new Rectangle(0, 46, 320, h);
    this._actionData = {'count':0, 'sy':h/10};
    Window_Base.prototype.initialize.call(this, rect);
    this.setupUiSprite(GetWindowUiName('TrackList'));
    this.setupStyleCopy();
    this.refresh();
    this.setup();
};
Window_TrackeList.prototype.setupStyleCopy = function() {
    if (!this._uiSprite) {
        this._styleCopy = new Sprite(new Bitmap(this.width, this.height));
        const bitmap = this._styleCopy.bitmap;
        for (const child of this._frameSprite.children) {
            const x = child.x, y = child.y;
            const rx = child._frame.x;
            const ry = child._frame.y;
            const rw = child._frame.width;
            const rh = child._frame.height
            const bw = rw * child.scale.x;
            const bh = rh * child.scale.y;
            bitmap.blt(this._windowskin, rx, ry, rw, rh, x, y, bw, bh);
        }
        this._styleCopy.hide();
        this.addChildToBack(this._styleCopy);
    }
};
Window_TrackeList.prototype.setup = function() {
    if (!$gameSystem.isTrackeWindowShow()) {
        const fy = this._actionData.sy * 10;
        if (this._styleCopy) {
            this._styleCopy.setFrame(0, fy, this.width, this.height - fy);
        }
        if (this._uiSprite) {
            this._uiSprite.setFrame(0, fy, this.width, this.height - fy);
        }
        this._contentsSprite.setFrame(0, fy, this.width, this.height - fy);
        this.hide();
    }
};
Window_TrackeList.prototype.lineHeight = function() {
    return 32;
};
Window_TrackeList.prototype.limitIconSize = function() {
    return this.lineHeight() - 4;
};
Window_TrackeList.prototype.resetFontSettings = function() {
    Window_Base.prototype.resetFontSettings.call(this);
    this.contents.fontSize = 18;
};
Window_TrackeList.prototype.refresh = function() {
    this.contents.clear();
    this.setupTasks();
    this.drawStyle();
    this.drawTasks();
    $gameTemp.setTaskNeedRefresh(false);
};
Window_TrackeList.prototype.setupTasks = function() {
    this._tasks = $gameSystem.trackedTasks().map(id => $gameParty.task(id));
};
Window_TrackeList.prototype.drawStyle = function() {
    for (let i=0;i<this._nums;++i) this.drawStyleBy(i)
};
Window_TrackeList.prototype.drawStyleBy = function(index) {
    /* 使用UI图片时不描绘方框 */
    if (!this._uiSprite) {
        const w = this.contents.width;
        const h = this.lineHeight() * 2;
        const frameColor = parameters['frameColor'];
        this.drawRoundRect(0, h * index + 2, w, h-4, 5, 0, '', frameColor);
    }
};
Window_TrackeList.prototype.drawTasks = function() {
    for (let i=0;i<this._nums;++i) this.drawTask(i);
};
Window_TrackeList.prototype.drawTask = function(index) {
    const task = this._tasks[index];
    const x = 4, w = this.contents.width;
    const y = this.lineHeight() * 2 * index;
    this.resetTextColor();
    if (task) {
        this.drawText(task.name(), x, y, w);
        let tw = this.textWidth(task.typeText()+' '+task.statusText());
        this.drawTaskStatus(task, w - tw - 4, y);
        let data = task.currentConditionData();
        if (data) {
            let text = ''+data.num+': '+data.cod.listText()
            this.drawTextEx(text, x, y + this.lineHeight());
            tw = this.textWidth(data.cod.numText());
            this.changeTextColor(data.cod.numTextColor());
            this.drawText(data.cod.numText(), w - tw - 4, y + this.lineHeight(), tw);
        }
    } else this.drawText('<待设置>', x, y, w);
};
Window_TrackeList.prototype.redrawTask = function(index) {
    const h = this.lineHeight() * 2;
    this.contents.clearRect(0, index * h, this.contents.width, h);
    this.drawStyleBy(index);
    this.drawTask(index);
};
Window_TrackeList.prototype.isInAction = function() {
    return this._actionData.count > 0;
};
Window_TrackeList.prototype.startAction = function() {
    const result = $gameSystem.isTrackeWindowShow();
    $gameSystem.setTrackeWindowState('show', !result);
    this._actionData.count = 10;
    this._actionData.type = result ? 0 : 1;
    this._backSprite.hide();
    if (this._styleCopy) {
        this._styleCopy.show();
        this.frameVisible = false;
    }
    this.show();
};
Window_TrackeList.prototype.onActionEnd = function() {
    this._actionData.count = 0;
    this._backSprite.show();
    if (this._styleCopy) {
        this._styleCopy.hide();
        this.frameVisible = true;
    }
    !this._actionData.type && this.hide();
};
Window_TrackeList.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    this.updateInfo();
    this.updateInput();
    this.updateAction();
};
Window_TrackeList.prototype.updateInfo = function() {
    if ($gameSystem.isTrackeWindowShow()) {
        $gameTemp.isTaskNeedRefresh() && this.refresh();
        while($gameTemp.hasTaskRefreshRegister()) {
            let index = $gameTemp.shiftTaskRefreshIndex();
            this.redrawTask(index);
        }
    }
};
Window_TrackeList.prototype.updateInput = function() {
    if (!this.isInAction() && Input.isTriggered('taskTracke')) {
        SoundManager.playOk();
        this.startAction();
    }
};
Window_TrackeList.prototype.updateAction = function() {
    if (this.isInAction()) {
        const sprite = this._styleCopy || this._uiSprite;
        const sy = this._actionData.type ? this._actionData.sy : -this._actionData.sy;
        const fy = sprite._frame.y - sy;
        const fh = sprite._frame.height + sy;
        this._contentsSprite.setFrame(0, fy, this._contentsSprite.width, fh);
        if (this._styleCopy) {
            this._styleCopy.setFrame(0, fy, this._frameSprite.width, fh);
        }
        if (this._uiSprite) {
            this._uiSprite.setFrame(0, fy, this._frameSprite.width, fh);
        }
        this._actionData.count--;
        !this.isInAction() && this.onActionEnd();
    }
};
Window_TrackeList.prototype._updateContents = function() {
};
//=================================================================================================
// 任务自动信息提示窗口
//=================================================================================================
function Window_TaskTips() {
    this.initialize(...arguments);
}
Window_TaskTips.prototype = Object.create(Window_Base.prototype);
Window_TaskTips.prototype.constructor = Window_TaskTips;
Window_TaskTips.prototype.initialize = function() {
    let data = null;
    const rect = new Rectangle();
    if (parameters['uiTips']) {
        data = JSON.parse(parameters['uiTips']);
    }
    rect.x = data ? parseInt(data.x) : 208;
    rect.y = data ? parseInt(data.y) : 100; 
    rect.width  = data ? parseInt(data.w) : 400; 
    rect.height = data ? parseInt(data.h) : 40;
    this._residenceTime = data ? parseInt(data.count) : 180;
    this._actionCount = 0;
    Window_Base.prototype.initialize.call(this, rect);
    this._padding = 0;
    this.setupUiSprite(data ? data.ui : '');
    this.createContents();
    this.hide();
};
Window_TaskTips.prototype.setupUiSprite = function(uiName) {
    this.opacity = 0;
    this._uiSprite = new Sprite();
    if (uiName) this._uiSprite.bitmap = ImageManager.loadPicture(uiName);
    else {
        this._uiSprite.bitmap = new Bitmap(this.width, this.height);
        this.drawUiSprite();
    }
    this.addChildToBack(this._uiSprite);
};
Window_TaskTips.prototype.lineHeight = function() {
    return this.contentsHeight();
};
Window_TaskTips.prototype.edge = function() {
    return 4;
};
Window_TaskTips.prototype.resetFontSettings = function() {
    Window_Base.prototype.resetFontSettings.call(this);
    this.contents.fontSize = this.lineHeight() - this.edge() * 2 - 8;
};
Window_TaskTips.prototype.drawUiSprite = function() {
    const color1 = 'rgba(0,0,0,120)';
    const color2 = 'rgba(50,50,50,120)';
    const color3 = 'rgba(0,0,0,0)';
    const bitmap = this._uiSprite.bitmap;
    const sw = this.width / 5, cw = this.width - sw * 2;
    bitmap.fillRect(sw, 0, cw, this.edge(), color1);
    bitmap.fillRect(sw, this.edge(), cw, this.height - this.edge() * 2, color2);
    bitmap.fillRect(sw, this.height - this.edge(), cw, this.edge(), color1);
    bitmap.gradientFillRect(0, 0, sw, this.edge(), color3, color1);
    bitmap.gradientFillRect(0, this.edge(), sw, this.height - this.edge() * 2, color3, color2);
    bitmap.gradientFillRect(0, this.height - this.edge(), sw, this.edge(), color3, color1);
    bitmap.gradientFillRect(this.width - sw, 0, sw, this.edge(), color1, color3);
    bitmap.gradientFillRect(this.width - sw, this.edge(), sw, this.height - this.edge() * 2, color2, color3);
    bitmap.gradientFillRect(this.width - sw, this.height - this.edge(), sw, this.edge(), color1, color3);
};
Window_TaskTips.prototype.drawInfo = function(text) {
    this.contents.clear();
    const cw = this.textSizeEx(text).width;
    this.drawTextEx(text, (this.width - cw) / 2, 2);
};
Window_TaskTips.prototype.startAction = function() {
    this._actionCount = 20 + this._residenceTime;
    const cy = this.height / 2;
    this._uiSprite.y = cy;
    this._contentsSprite.y = cy;
    this._uiSprite.setFrame(0, cy, this.width, 0);
    this._contentsSprite.setFrame(0, cy, this.width, 0);
};
Window_TaskTips.prototype.refreshAction = function() {
    if (this._actionCount > (this._residenceTime + 10) || this._actionCount < 10) {
        const sn = this.height / 20;
        const ay = this._actionCount < 10 ? sn : -sn;
        const fy = this._uiSprite._frame.y + ay;
        const fh = this._uiSprite._frame.height - ay * 2;
        this._uiSprite.y += ay;
        this._contentsSprite.y += ay;
        this._uiSprite.setFrame(0, fy, this.width, fh);
        this._contentsSprite.setFrame(0, fy, this.width, fh);
    }
};
Window_TaskTips.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    this.updateInfos();
    this.updateAction();
};
Window_TaskTips.prototype.updateInfos = function() {
    if (!this._actionCount && $gameTemp.hasTaskPromptInfo()) {
        const text = $gameTemp.taskShiftPromptInfo();
        this.drawInfo(text);
        this.startAction();
        this.show();
    }
};
Window_TaskTips.prototype.updateAction = function() {
    if (this._actionCount > 0) {
        this._actionCount--;
        this.refreshAction();
        !this._actionCount && this.hide();
    }
};
Window_TaskTips.prototype._updateContents = function() {
};
//=================================================================================================
const XR_Window_MenuCommand_addFormationCommand = Window_MenuCommand.prototype.addFormationCommand;
Window_MenuCommand.prototype.addFormationCommand = function() {
    if ($gameSystem.isTaskEnabled()) {
        const word = GetWord('Task').replace(/\s/g, '');
        this.addCommand(word, 'task', true);
    }
    XR_Window_MenuCommand_addFormationCommand.call(this);
};
//=================================================================================================
const XR_Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
Window_Options.prototype.addGeneralOptions = function() {
    XR_Window_Options_addGeneralOptions.call(this);
    if ($gameSystem.isTaskEnabled()) {
        this.addCommand('任务追踪', 'taskTrack');
    }
};
const XR_Window_Options_getConfigValue = Window_Options.prototype.getConfigValue;
Window_Options.prototype.getConfigValue = function(symbol) {
    if (symbol === 'taskTrack') return $gameSystem.trackeWindowVisibility();
    return XR_Window_Options_getConfigValue.call(this, symbol);
};
const XR_Window_Options_setConfigValue = Window_Options.prototype.setConfigValue;
Window_Options.prototype.setConfigValue = function(symbol, value) {
    if (symbol === 'taskTrack') $gameSystem.setTrackeWindowState('visibility', value);
    else XR_Window_Options_setConfigValue.call(this, symbol, value);
};
//=================================================================================================
// 任务场景
//=================================================================================================
function Scene_Task() {
    this.initialize(...arguments);
}
Scene_Task.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Task.prototype.constructor = Scene_Task;
Scene_Task.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createTitleWindow();
    this.createLabelWindow();
    this.createListWindow();
    this.createInfoWindow();
};
Scene_Task.prototype.createTitleWindow = function() {
    this._titleWindow = new Window_TaskTitle();
    this.addWindow(this._titleWindow);
};
Scene_Task.prototype.createLabelWindow = function() {
    this._labelWindow = new Window_TaskLabel();
    this._labelWindow.setHandler('ok',     this.gotoChoiceTask.bind(this));
    this._labelWindow.setHandler('label',  this.refreshListWindow.bind(this));
    this._labelWindow.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._labelWindow);
};
Scene_Task.prototype.createListWindow = function() {
    this._listWindow = new Window_TaskList();
    this._listWindow.setHandler('info',   this.refreshInfoWindow.bind(this));
    this._listWindow.setHandler('cancel', this.gotoChoiceLabel.bind(this));
    this.addWindow(this._listWindow);
};
Scene_Task.prototype.createInfoWindow = function() {
    this._infoWindow = new Window_TaskInfo();
    this.addWindow(this._infoWindow);
};
Scene_Task.prototype.needsCancelButton = function() {
    return !!eval(parameters['cancelButton']);
};
Scene_Task.prototype.createCancelButton = function() {
    Scene_MenuBase.prototype.createCancelButton.call(this);
    if (this._cancelButton) {
        /* 取消按钮的坐标(x, y) */
        this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
        this._cancelButton.y = this.buttonY();
    }
};
Scene_Task.prototype.gotoChoiceTask = function() {
    this._labelWindow.select(-1);
    this._listWindow.select(0);
    this._listWindow.activate();
};
Scene_Task.prototype.gotoChoiceLabel = function() {
    this._listWindow.select(-1);
    this._labelWindow.select(0);
    this._labelWindow.activate();
};
Scene_Task.prototype.refreshListWindow = function() {
    const labels = this._labelWindow.labels();
    this._listWindow.onLabelsChange(labels);
};
Scene_Task.prototype.refreshInfoWindow = function() {
    const task = this._listWindow.item();
    this._infoWindow.setCurrentTask(task);
};
window.Scene_Task = Scene_Task;
//=================================================================================================
const XR_Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() {
    this.createTaskWindow();
    XR_Scene_Map_createAllWindows.call(this);
    this.createTaskInfoWindow();
};
Scene_Map.prototype.createTaskWindow = function() {
    this._taskWindow = new Window_TaskTracke();
    this.addChild(this._taskWindow);
};
Scene_Map.prototype.createTaskInfoWindow = function() {
    if ($gameTemp.isTaskInfosEnabled()) {
        this._taskInfoWindow = new Window_TaskTips();
        this.addChild(this._taskInfoWindow);
    }
};
const XR_Scene_Map_isAnyButtonPressed = Scene_Map.prototype.isAnyButtonPressed;
Scene_Map.prototype.isAnyButtonPressed = function() {
    if (this._taskWindow && this._taskWindow.isHovered()) return true;
    return XR_Scene_Map_isAnyButtonPressed.call(this);
};
//=================================================================================================
const XR_Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
    XR_Scene_Menu_createCommandWindow.call(this);
    this._commandWindow.setHandler('task', this.commandTask.bind(this));
};
Scene_Menu.prototype.commandTask = function() {
    SceneManager.push(Scene_Task);
};
//=================================================================================================    
})();
//=================================================================================================
// end
//=================================================================================================