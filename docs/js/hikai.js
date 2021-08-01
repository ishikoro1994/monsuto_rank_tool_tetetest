var getStoneType = [100, 150, 500];
var endDate = new Date(2021, 10, 10);
var daysLeft = 0;
var hituyosu = 0;
var hituyosuMax = 0;
var itemList = [];

/**
 * ページ読み込み時
 */
$(document).ready(function() {
    var today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    daysLeft = (endDate - today) / 86400000;
    daysLeft++;
    $('#days_left').text('あと' + daysLeft + '日');

    var d = new $.Deferred();
    async(function() {
        setItemListBody();
        d.resolve();
    });
    d.promise()
        .then(function() {
            var d2 = new $.Deferred();
            async(function() {
                setLapCountBody();
                d2.resolve();
            });
            return d2.promise();
        });
    });

function async(f) {
    setTimeout(f, 500);
}

/**
 * 所持数変更イベント
 */
function changeSyozisu() {
    setHituyosu();
    setLapCountBody();
}

/**
 * 周回数設定
 */
function setLapCountBody() {
    $('#lap_count_tbody').empty();
    for (var i = 0; i < getStoneType.length; i++) {
        var rowStr = '';
        rowStr += '<tr>';
        // 1周獲得秘海石
        rowStr += '<td>' + getStoneType[i] + '</td>';
        // 周回数
        var lapCount = Math.ceil(hituyosu / getStoneType[i]);
        rowStr += '<td>' + lapCount + '</td>';
        // 周回数／日
        rowStr += '<td>' + Math.ceil(lapCount / daysLeft); + '</td>';

        rowStr += '</tr>';
        $('#lap_count_tbody').append(rowStr);
    }
}

/**
 * 交換リスト設定
 */
function setItemListBody() {
    $('#item_list_tbody').empty();
    $.getJSON('./data/item_list.json' , function(data) {
        itemList = data;
        var len = itemList.length;
        for(var i = 0; i < len; i++) {
          var rowStr = '';
          rowStr += '<tr>';
          // 引き換え対象
          rowStr += '<td id="item_name' + i +'">' + data[i].item_name + '</td>';
          // 交換1回に必要な「秘海石」
          rowStr += '<td id="stone'+ i +'">' + data[i].point + '</td>';
          // 上限
          rowStr += '<td id="limit'+ i +'">' + data[i].limit + '</td>';
          // 上限までに必要な「秘海石」
          rowStr += '<td id="stone_limit' + i + '">' + (Number(data[i].point) * Number(data[i].limit)) + '</td>';
          hituyosu += Number(data[i].point) * Number(data[i].limit);
          // 交換済個数
          rowStr += '<td><input type="tel" id="changed_count' + i + '" class="changed_count input_column" maxlength="2"></td>';
          // 取得済
          rowStr += '<td id="fin_button' + i + '"><button class="fin_button" value="' + i + '">取得済</button></td>';

          rowStr += '</tr>';
          $('#item_list_tbody').append(rowStr);
        }
        setHituyosu();
    });
}

/**
 * 必要数設定
 */
function setHituyosu() {
    var syozisu = $('#syozisu').val();
    if (!syozisu) {
        syozisu = 0;
    }

    hituyosu = 0;
    for (var i = 0; i < itemList.length; i++) {
        var changedCount = $('#changed_count' + i).val();
        if (!changedCount) {
            changedCount = 0;
        }
        changedCount = Number(changedCount); // 交換済個数
        var stone = Number($('#stone' + i).text()); // 上限までに必要な個数
        var limit = Number($('#limit' + i).text()); // 上限
        hituyosu += (stone * (limit - changedCount));
    }
    hituyosu = hituyosu - syozisu;
    var hituyosuDays = 0;
    if (hituyosu > 0) {
        hituyosuDays = Math.ceil(hituyosu / daysLeft);
    } else {
        hituyosu = 0;
    }
    $('#hituyosu').text(hituyosu);
    $('#hituyosu_days').text(hituyosuDays);
}

/**
 * 交換済ボタン押下イベント
 */
$(document).on('click', '.fin_button', function() {
    var row = $(this).val();
    $('#changed_count' + row).val(itemList[row].limit);
    setHituyosu();
});

/**
 * 交換済個数変更イベント
 */
 $(document).on('change', '.changed_count', function() {
    // 自身のidから行数を取得し、上限と見比べて、多ければ戻す
    setHituyosu();
});
