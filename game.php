<?php

$bet = floatval($_POST["bet"]);

$lineMap = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0 ,1, 2],

    [1, 0, 0, 0, 1],
    [1, 2, 2, 2, 1],
    [0, 1, 0, 1, 0],
    [2, 1, 2, 1, 2],
    [1, 0, 1, 0, 1],

    [1, 2, 1, 2, 1],
    [2, 2, 1, 0, 0],
    [0, 0, 1, 2, 2],
    [2, 1, 1, 1, 2],
    [0, 1, 1, 1, 0],

    [0, 0, 1, 0, 0],
    [2, 2, 1, 2, 2],
    [1, 1, 0, 1, 1],
    [1, 1, 2, 1, 1],
    [0, 2, 0, 2, 0],

    [2, 0, 2, 0, 2],
    [0 ,0, 2, 0, 0],
    [2, 2, 0, 2, 2],
    [1, 0, 2, 0, 1],
    [1, 2, 0, 2, 1]
];

$originalReel = [
    [
        'hunter', 'K',      'A',      'Q',
        'hunter', 'J',      'Q',      'A',
        'hunter', 'dog',    'dino',   'K',
        'gun',    'hunter', 'J',      'goggles',
        'Q',      'K',      'hunter', 'A',
        'pipe',   'dino',   'K',      'goggles',
        'gun',    'J',      'dog',    'dino',
        'J',      'pipe',   'dog',      'J',
        'Q',      'K',      'gun',    'A',
        'goggles', 'K',     'A',      'pipe'
    ],

//2
    [
        'gun',     'A',      'Q',      'J',
        'pipe',    'gun',    'A',      'K',
        'goggles', 'Q',      'dog',    'K',
        'J',       'pipe',   'hunter', 'goggles',
        'dog',     'A',      'Q',      'gun',
        'J',       'K',      'Q',      'gun',
        'hunter',  'A',      'K',      'gun',
        'J',       'hunter', 'Q',      'J',
        'dog',      'pipe',  'A',      'J',
        'Q',         'gun',    'K',      'dog'
    ],

//3
    [
        'pipe',   'A',       'Q',       'hunter',
        'gun',    'A',       'J',       'pipe',
        'K',      'J',       'hunter',  'A',
        'J',      'Q',       'A',       'gun',
        'K',      'Q',       'A',       'J',
        'dog',    'Q',       'goggles', 'K',
        'dog',    'goggles', 'J',       'K',
        'hunter', 'J',       'A',      'goggles',
        'Q',      'A',        'dog',    'gun',
        'J',       'pipe',     'A',     'Q'
    ],

//4
    [
        'pipe',    'gun',     'A',      'J',
        'pipe',    'K',       'Q',      'dog',
        'A',       'goggles', 'gun',    'dog',
        'pipe',    'hunter',  'Q',      'A',
        'hunter',  'J',       'A',      'K',
        'goggles', 'Q',       'hunter', 'K',
        'Q',       'J',       'K',      'Q',
        'J',       'K',       'gun',     'J',
        'K',       'dog',     'Q',      'K',
        'A',        'K',       'J',      'goggles'
    ],

//5
    [
        'dog',     'Q',    'dino',    'J',
        'Q',       'dino', 'J',       'pipe',
        'hunter',  'A',    'J',       'Q',
        'pipe',    'K',    'gun',     'J',
        'pipe',    'A',    'J',       'dino',
        'K',       'A',    'Q',       'K',
        'A',       'dino', 'goggles', 'K',
        'Q',       'dog',  'K',       'pipe',
        'hunter',  'J',    'A',       'Q',
        'goggles', 'J',    'hunter',  'K',
        'gun',     'dino', 'Q',       'goggles',
        'A',        'Q',    'K',      'pipe',
        'J',        'A',     'Q',       'J'
    ]
];
$payment = [
    'hunter_5' => 16,
    'hunter_4'=> 6,
    'hunter_3'=> 1.2,
    'dog_5'=> 10,
    'dog_4'=> 3,
    'dog_3'=> 1,
    'gun_5'=> 5,
    'gun_4'=> 3,
    'gun_3'=> 1,
    'goggles_5'=> 4,
    'goggles_4'=> 1.6,
    'goggles_3'=> 0.4,
    'pipe_5'=> 3,
    'pipe_4'=> 1.6,
    'pipe_3'=> 0.4,
    'A_5'=> 2,
    'A_4'=> 0.8,
    'A_3'=>0.28,
    'K_5'=>1.6,
    'K_4'=>0.8,
    'K_3'=> 0.28,
    'Q_5'=> 1,
    'Q_4'=> 0.4,
    'Q_3'=> 0.2,
    'J_5'=> 0.8,
    'J_4'=>0.4,
    'J_3'=> 0.2
    ];
	
$response = false;

session_start();

if (!array_key_exists('mark', $_SESSION)) {
    echo json_encode(['mark' => 'restart']);
    exit;
} else {
   if ($_POST['mark'] - 1 != $_SESSION['mark'])  {
       echo json_encode(['mark' => 'restart']);
       exit;
   } else  $_SESSION['mark'] = $_POST['mark'];
}


$fullTankLevel = $_SESSION['fullTankLevel'];
$kef = 1;

if ($_SESSION['freeSpin']) {
    if ($_SESSION['freeSpin'][0] == 2) {
        $_SESSION['freeSpin'] = false;
        $_SESSION['freeSpinTankLevel'] = [['level'=> 0, 'action' => false], ['level'=> 0, 'action' => false]];
    }
} else $_SESSION['balance'] -= $bet;

$freeSpinTankLevel = $_SESSION['freeSpinTankLevel'];


if(!$_SESSION['freeSpin']) {

    $strBet = strval($bet);
    for ($i = 0; $i < count($fullTankLevel); $i++) {
        if (array_key_exists($strBet, $fullTankLevel[$i])) {
            $result = $fullTankLevel[$i][$strBet]['level'] + rand(5, 15);
            if ($result > 92) $result = 100;

            if ($result == 100 && $fullTankLevel[$i][$strBet]['level'] < 100) {
                $fullTankLevel[$i][$strBet]['action'] = true;
                $fullTankLevel[$i][$strBet]['activate'] = true;

            } else $fullTankLevel[$i][$strBet]['action'] = false;

            $fullTankLevel[$i][$strBet]['level'] = $result;
        } else {
            $fullTankLevel[$i][$strBet] = [];
            $fullTankLevel[$i][$strBet]['level'] = rand(5, 15);
            $fullTankLevel[$i][$strBet]['action'] = false;
        }
    }


    if ($fullTankLevel[1][$strBet]['activate']) $wild = true;
    else $wild = false;

    if ($fullTankLevel[0][$strBet]['activate']) $kef = 3;
    else $kef = 1;

    $_SESSION['fullTankLevel'] = $fullTankLevel;

} else {

    for ($i = 0; $i < count($freeSpinTankLevel); $i++) {
        $result = $freeSpinTankLevel[$i]['level'] + rand(20, 35);

        if ($result > 92) $result = 100;

        if ($result == 100 && $freeSpinTankLevel[$i]['level'] < 100) $freeSpinTankLevel[$i]['action'] = true;
        else $freeSpinTankLevel[$i]['action'] = false;

        $freeSpinTankLevel[$i]['level'] = $result;
    }

    $wild = true;

    if ($freeSpinTankLevel[0]['action']) {
        $kef = $_SESSION['freeSpin'][2] + 1;
        $_SESSION['freeSpin'][2] = $kef;

    } else $kef = $_SESSION['freeSpin'][2];


    if ($freeSpinTankLevel[1]['action']) {
        $spin = $_SESSION['freeSpin'][1] + 2;
        $_SESSION['freeSpin'][1] = $spin;
    }

    $_SESSION['freeSpinTankLevel'] = $freeSpinTankLevel;
}


while (!$response) $response = getResponse($originalReel, $payment, $lineMap, $wild, $bet, $fullTankLevel, $kef, $freeSpinTankLevel);
echo (json_encode($response));


function getResponse($originalReel, $payment,  $lineMap, $wild, $bet, $fullTankLevel, $kef, $freeSpinTankLevel) {

    $shootHunter = false;
    $extDino = false;

    $numbSymb = [
        rand(0, count($originalReel[0]) - 1),
        rand(0, count($originalReel[1]) - 1),
        rand(0, count($originalReel[2]) - 1),
        rand(0, count($originalReel[3]) - 1),
        rand(0, count($originalReel[4]) - 1)
    ];

    $matrix = [];
    for ($i = 0; $i < count($numbSymb); $i++)  array_push($matrix, [preSymb($numbSymb[$i], $i), $numbSymb[$i], postSymb($numbSymb[$i], $i)]);
    for ($i = 0; $i < count($matrix); $i++) for($k = 0; $k < count($matrix[$i]); $k++) $matrix[$i][$k] = $originalReel[$i][ $matrix[$i][$k] ];

    if ($wild) {
        $isDino = detectDino($matrix);

        if ($isDino) {
            if (!$isDino[0] || !$isDino[1]) {

                if($isDino[0]) $dino =  $isDino[0];
                else $dino =  $isDino[1];
                if ($isDino[0])  $hunter =  detectHunter($matrix);
                else  $hunter = detectHunter($matrix, true);
                if($hunter) {
                    $whiteHunter = getWhiteHunter($hunter, $dino);

                    if ($whiteHunter) {
                        $shootHunter = [$whiteHunter];
                        $extDino = [getExtDino($dino, $whiteHunter)];
                    } else return false;
                }
            } else {
                $dino = $isDino;
                $hunterLeft = detectHunter($matrix);

                if($hunterLeft) { // если есть хоть какой-то охотник
                    $whiteHunterLeft = getWhiteHunter($hunterLeft, $dino[0]);

                    if (!$whiteHunterLeft) { // охотник есть, но не подходит для левого дино и он только один, значит используем его для стрельбы в правого дино
                        $whiteHunterRight = getWhiteHunter($hunterLeft, $dino[1]);
                        $shootHunter = [$whiteHunterRight];
                        $extDino = [getExtDino($dino[1], $whiteHunterRight)];

                    } else { // если подошел охотник для стрельбы в левого дино. Нужно узнать сможет ли он закрыться расширяющимся правым дино.
                                // Для этого узнаем есть ли другой охотник, который может стрелять в правого дино
                                $hunterRight = detectHunter($matrix, true);
                                $whiteHunterRight = getWhiteHunter($hunterRight, $dino[1]);

                        if (!$whiteHunterRight) { // охотник только один и не подходит для правого, стреляем в левого дино
                            $shootHunter = [$whiteHunterLeft];
                            $extDino = [getExtDino($dino[0], $whiteHunterLeft)];

                        } else if (($whiteHunterLeft[0] == $whiteHunterRight[0]) || ($whiteHunterRight[0] < $whiteHunterLeft[0]) || isBlackHunter ($whiteHunterRight, $dino[0])) {  // или это один и тот же охотник или он заходит в зону первого

                                 if (isBlackHunter ($hunterRight[0], $dino[1]) ) return false; // c права есть охотник, который останется с неразширенным дино

                                $shootHunter = [$whiteHunterLeft]; // стреляем в левого, правый дино без блек охотника и он не разширится
                                $extDino = [getExtDino($dino[0], $whiteHunterLeft)];
                        } else {

                            return false; // исключаем появление двух дино с двумя охотниками
                        }
                    }
                }

            }
        }
    }

    if ($extDino) {
        $access = false;
        if (!$_SESSION['freeSpin']) $access = true;
        else if ($_SESSION['freeSpin'][0] == 0) $access = true;

        if($access) {
            $_SESSION['fullTankLevel'][1][strval($bet)]['activate'] = false;
            $_SESSION['fullTankLevel'][1][strval($bet)]['level'] = 0;
        }
    }

    $arrResult = [[], [], [], [], []];

    $answer = scanLine($payment, $lineMap, $matrix, $extDino, $bet, false, $kef);

    $arrResult[0] = $answer[0];
    $animateSmallDino = $answer[1];
    $arrResult[3] = $answer[2];


    if ($shootHunter) {
        $arrResult[1]['shootHunter'] = $shootHunter;
        $arrResult[1]['extDino'] = $extDino;
    }

    if (count($animateSmallDino)) $arrResult[1]['animateSmallDino'] = $animateSmallDino;


    if($_SESSION['freeSpin']) $arrResult[2] = false;
    else $arrResult[2] = detectScatter($matrix);


    if (count($arrResult[0])) {
        $flashLineAllwin = getFlashLineAllwin($arrResult[0]);
        $arrResult[1]['flashLine'] = $flashLineAllwin[0];
        $arrResult[4]['allWin'] = $flashLineAllwin[1];
    }

    if (detectDino($matrix)[1]) {
        $reverseAnswer = scanLine($payment, $lineMap, $matrix, $extDino, $bet, true, $kef);
        if(count($reverseAnswer[0])) {
            $reverseFlashLineAllwin = getFlashLineAllwin($reverseAnswer[0]);
            $reverseAllWin = $reverseFlashLineAllwin[1];

            $isAllWinExists = array_key_exists('allWin', $arrResult[4]);

            if(!$isAllWinExists || ($isAllWinExists && $reverseAllWin > $arrResult[4]['allWin'])) {
                $reverseAnimateSmallDino = $reverseAnswer[1];
                $reverseHunterTop = $reverseAnswer[2];
                $reverseFlashLine = $reverseFlashLineAllwin[0];

                $arrResult[0] = $reverseAnswer[0];
                $arrResult[1]['animateSmallDino'] = $reverseAnimateSmallDino;
                $arrResult[1]['flashLine'] = $reverseFlashLine;
                $arrResult[3] = $reverseHunterTop;
                $arrResult[4]['allWin'] = $reverseAllWin;
            }
        }
    }

    $arrResult[4]['bet'] = $bet;

    function tankLevelFormat($arr) {
       $newArr = [];
       foreach ($arr as $k => $val) $newArr[$k] = $val['level'];
       return $newArr;
    }


    if (array_key_exists('allWin', $arrResult[4])) {
        $_SESSION['balance'] += $arrResult[4]['allWin'];

        if($_SESSION['fullTankLevel'][0][strval($bet)]['level'] == 100) {
            $_SESSION['fullTankLevel'][0][strval($bet)]['activate'] = false;
            $_SESSION['fullTankLevel'][0][strval($bet)]['level'] = 0;
        }

        if ($_SESSION['freeSpinTankLevel'][0]['level'] == 100) $_SESSION['freeSpinTankLevel'][0]['level'] = 0;
        if ($_SESSION['freeSpinTankLevel'][1]['level'] == 100) $_SESSION['freeSpinTankLevel'][1]['level'] = 0;
    }

    $arrResult[4]['tankLevel'] = [ tankLevelFormat($fullTankLevel[0]), tankLevelFormat($fullTankLevel[1]) ];
    $arrResult[4]['multiplayer'] = $fullTankLevel[0][strval($bet)]['action'];
    $arrResult[4]['wildExp'] = $fullTankLevel[1][strval($bet)]['action'];
    $arrResult[4]['k'] = $kef;

    $arrResult[4]['freeSpinTankLevel'] = [$freeSpinTankLevel[0]['level'], $freeSpinTankLevel[1]['level']];
    $arrResult[4]['freeSpinMultiplayer'] = $freeSpinTankLevel[0]['action'];
    $arrResult[4]['freeSpinfreeGame'] = $freeSpinTankLevel[1]['action'];


   if ($_SESSION['freeSpin']) {
        $lostSpin = $_SESSION['freeSpin'][1] - 1;
        $_SESSION['freeSpin'][1] = $lostSpin;
        $_SESSION['freeSpin'][4] += 1;
        if (!$lostSpin) $_SESSION['freeSpin'][0] = 2;

        if (array_key_exists('allWin', $arrResult[4])) $_SESSION['freeSpin'][3] += $arrResult[4]['allWin'];
   }


    if (detectFreeSpin($matrix)) {
        if ($_SESSION['freeSpin']) $arrResult[4]['freeSpin'] = $_SESSION['freeSpin'];
        else {
            $arrResult[4]['freeSpin'] = [0, 10, 1, 0, 0];
            $_SESSION['freeSpin'] = [1, 10, 1, 0, 0];
        }
    } else $arrResult[4]['freeSpin'] = $_SESSION['freeSpin'];



    return respFormat($matrix, $arrResult, $bet);
}

function getFlashLineAllwin($data) {

        $flashLine = [];
        $allWin = 0;
        foreach($data as $item) {
            $allWin += $item[2];
            $arr = $item[3];
            for ($i = 0; $i < count($arr); $i++) {
                $reel = $i;
                $row = $arr[$i];

                if ($row !== false) {
                    $allready = false;
                    foreach ($flashLine as $item2) if ($item2[0] == $reel && $item2[1] == $row) $allready = true;
                    if (!$allready) array_push($flashLine, [$reel, $row]);
                }

            }
        }

    return [$flashLine, $allWin];
}

function scanLine($payment, $lineMap, $matrix, $extDino, $bet, $reverse, $kef) {

    $lineResult = [];
    $animateSmallDino = [];
    $hunterTopParam = [];

    foreach ($payment as $k => $value) {
        $arr = explode('_', $k);

        $symbol = $arr[0];
        $countElm = (int)$arr[1];


        for ($j = 0; $j < count($lineMap); $j++) {

            $result = true;
            $smallDino = [];

            if(!$reverse) {
                for ($i = 0; $i < $countElm; $i++) {

                    if ($matrix[$i][$lineMap[$j][$i]] == 'dino') array_push($smallDino, [$i, $lineMap[$j][$i]]);

                    $matrixSymbol = getMatrixSymbol($extDino, $i, $lineMap[$j][$i], $matrix);
                    if ($matrixSymbol != $symbol && $matrixSymbol != 'dino') {
                        $result = false;
                        $smallDino = false;
                        break;
                    }
                }

            } else {

                for ($i = 4; $i > 4 - $countElm; $i--) {

                    if ($matrix[$i][$lineMap[$j][$i]] == 'dino') array_push($smallDino, [$i, $lineMap[$j][$i]]);

                    $matrixSymbol = getMatrixSymbol($extDino, $i, $lineMap[$j][$i], $matrix);
                    if ($matrixSymbol != $symbol && $matrixSymbol != 'dino') {
                        $result = false;
                        $smallDino = false;
                        break;
                    }
                }
            }

            if ($result && ($countElm == 4 || $countElm == 3)) {

                if (!$reverse) $x = $countElm;
                else $x = 4 - $countElm;


                $matrixSymbol = getMatrixSymbol($extDino, $x, $lineMap[$j][$countElm], $matrix);
                if ($matrixSymbol == $symbol || $matrixSymbol == 'dino') {
                    $result = false;
                    $smallDino = false;
                }
            }


            if ($smallDino) {
                $temp = [];
                foreach ($smallDino as $item) {
                    $allready = false;
                    foreach ($animateSmallDino as $item2) if ($item[0] == $item2[0] && $item[1] == $item2[1]) $allready = true;
                    if(!$allready) array_push($temp, $item);
                }

                foreach ($temp as $item)  array_push($animateSmallDino, $item);
            }


            if ($result) {
                $lineFrame = [];
                for ($i = 0; $i < 5; $i++) array_push($lineFrame, false);

                if(!$reverse) for ($i = 0; $i < $countElm; $i++)  $lineFrame[$i] = $lineMap[$j][$i];
                else for ($i = 4; $i > 4 - $countElm; $i--)  $lineFrame[$i] = $lineMap[$j][$i];


                array_push($lineResult, [$j + 1, $countElm, round($payment[$k] * $bet * $kef, 2), $lineFrame]);
                if ($symbol == 'hunter')  array_push($hunterTopParam, [$j, $countElm]);
            }

        }
    }

    $hunterTop = false;
    if (count($hunterTopParam))  $hunterTop = getHunterTop($hunterTopParam, $matrix, $lineMap, $extDino, $reverse);

    return [$lineResult, $animateSmallDino, $hunterTop];

}

function respFormat($matrix, $arrResult, $bet) {

    $response = [
        'reel_0'=> null,
        'reel_1'=> null,
        'reel_2'=> null,
        'reel_3'=> null,
        'reel_4'=> null
    ];

    $symbols = [[]];
    for ($i = 0; $i < count($matrix); $i++) {
        for ($k = 0; $k < count($matrix[$i]); $k++)  $symbols[$i][$k] = symbToNumb($matrix[$i][$k]);
    }

    $i = 0;
    foreach ($response as  $k => $value) {
        $response[$k] = $symbols[$i];
        $i++;
    }

    if (count($arrResult[0])) {
        $preSortLines = [];
        for($i = 0; $i < 25; $i++) array_push($preSortLines, null);

        foreach ($arrResult[0] as $item) {
            $iter = $item[0];
            $preSortLines[$iter - 1] = $item;
        }

        $sortLines = [];
        foreach ($preSortLines as $item) if ($item) array_push($sortLines, $item);
        $response['lines'] = $sortLines;
    }
    else $response['lines'] = false;

    if (count($arrResult[1]))  {
        $param = [];
        if (array_key_exists('shootHunter', $arrResult[1])) {

            $shootHunter = $arrResult[1]['shootHunter'];
            $extDino = $arrResult[1]['extDino'];

            $dinoParam = [];
            for ($i = 0; $i < count($extDino); $i++) array_push($dinoParam, $extDino[$i][1]);

            $shootHunterMethod = [];
            for ($i = 0; $i < count($shootHunter); $i++) array_push($shootHunterMethod, getHunterAnimateMethod($shootHunter[$i], $dinoParam[$i]));

            for ($i = 0; $i < count($dinoParam); $i++) array_push($param, ['showDinoBig', $dinoParam[$i]]);
            for ($i = 0; $i < count($shootHunterMethod); $i++) array_push($param, [$shootHunterMethod[$i], $shootHunter[$i]]);

        }

        if (array_key_exists('animateSmallDino', $arrResult[1])) {
            $smallDinoParam = $arrResult[1]['animateSmallDino'];

            if(!array_key_exists('extDino', $arrResult[1])) foreach ($smallDinoParam as $item)  array_push( $param, ['showDinoSmall', $item]);
            else {
                $extDino = $arrResult[1]['extDino'];

                $tempDino = [];
                foreach ($extDino as $item) {
                    foreach ($item[0] as $item2) if ($item2[0] == 0 || $item2[0] == 4)  array_push($tempDino, $item2[0]);
                }

                $newSmallDinoParam = [];
                foreach ($smallDinoParam as $item) {
                    $result = false;
                    foreach ($tempDino as $reel) if($item[0] == $reel) $result = true;
                    if(!$result) array_push($newSmallDinoParam, $item);
                }

                if(count($newSmallDinoParam)) foreach ($newSmallDinoParam as $item)  array_push( $param, ['showDinoSmall', $item]);
            }

        }

        if (array_key_exists('flashLine', $arrResult[1])) array_push($param, ['flashLine', $arrResult[1]['flashLine'] ]);

        $bet = $arrResult[4]['bet'];
        $allWin = $arrResult[4]['allWin'];

        if ($allWin  >= $bet * 20) {
            array_push($param, ['bigWin', round($arrResult[4]['allWin'])]);
        }

        $response['animateAfterStopReels'] = $param;

    } else $response['animateAfterStopReels'] = false;

    $response['scatter'] = $arrResult[2];
    $response['postAnimate'] = $arrResult[3];
    $response['bet'] = $arrResult[4]['bet'];
    $response['tankLevel'] = $arrResult[4]['tankLevel'];
    $response['multiplayer'] = $arrResult[4]['multiplayer'];
    $response['wildExp'] = $arrResult[4]['wildExp'];
    $response['k'] = $arrResult[4]['k'];
    $response['freeSpin'] = $arrResult[4]['freeSpin'];
    $response['freeSpinTankLevel'] = $arrResult[4]['freeSpinTankLevel'];
    $response['freeSpinMultiplayer'] = $arrResult[4]['freeSpinMultiplayer'];
    $response['freeSpinfreeGame'] = $arrResult[4]['freeSpinfreeGame'];
    $response['balance'] = $_SESSION['balance'];


    if (array_key_exists('allWin', $arrResult[4]))  $response['allWin'] = $arrResult[4]['allWin'];

    return $response;
}

function getHunterTop($hunterTopParam, $matrix, $lineMap, $extDino, $reverse = false) {

    $hunterTop = [];
    foreach ($hunterTopParam as $item) {
        $line = $item[0];
        $count =  $item[1];

        if(!$reverse) {
            for ($i = 0; $i < $count; $i++) {
                $matrixSymbol = getMatrixSymbol($extDino, $i, $lineMap[$line][$i], $matrix);
                if ($matrixSymbol != 'dino') array_push($hunterTop, ['hunterTop', [$i, $lineMap[$line][$i]]]);
            }
        } else {
            for ($i = 4; $i > 4 - $count; $i--) {
                $matrixSymbol = getMatrixSymbol($extDino, $i, $lineMap[$line][$i], $matrix);
                if ($matrixSymbol != 'dino') array_push($hunterTop, ['hunterTop', [$i, $lineMap[$line][$i]]]);
            }
        }
    }

    $filterHunterTop = [];

    foreach ($hunterTop as $item) {
        $find  = false;
        foreach ($filterHunterTop as $item2) if($item[1][0] == $item2[1][0] && $item[1][1] == $item2[1][1]) $find = true;
        if(!$find) array_push($filterHunterTop, $item);
    }

    return $filterHunterTop;
}

function detectScatter($matrix) {
    $isHunter = false;
    $isGun = false;

    for ($i = 0; $i < count($matrix[0]); $i++) if ($matrix[0][$i] == 'hunter') $isHunter = [0, $i];
    for ($i = 0; $i < count($matrix[1]); $i++) if ($matrix[1][$i] == 'gun') $isGun = true;

    if ($isHunter && $isGun) return $isHunter;
    else return false;
}

function detectFreeSpin($matrix) {
    $isHunter = false;
    $isGun = false;
    $isDino = false;

    for ($i = 0; $i < count($matrix[0]); $i++) if ($matrix[0][$i] == 'hunter') $isHunter = true;
    for ($i = 0; $i < count($matrix[1]); $i++) if ($matrix[1][$i] == 'gun') $isGun = true;
    for ($i = 0; $i < count($matrix[4]); $i++) if ($matrix[4][$i] == 'dino') $isDino = true;

    if ($isHunter && $isGun && $isDino) return true;
    else return false;
}

function getHunterAnimateMethod($hunter, $dinoParam) {

    if ( ($dinoParam[0] == 1 && $dinoParam[1] == 0) || ($dinoParam[0] == 2 && $dinoParam[1] == 1) ) {

        if ($hunter[0] == 0 && $hunter[1] == 2) $hunterMethod = 'hunterRightUp';
        else if ($hunter[0] == 1 && $hunter[1] == 2) $hunterMethod = 'hunterLeftUp';
        else if ($hunter[0] == 2 && $hunter[1] == 2 ||
                 $hunter[0] == 3 && $hunter[1] == 2 ||
                 $hunter[0] == 4 && $hunter[1] == 2 ||
                 $hunter[0] == 2 && $hunter[1] == 1 ||
                 $hunter[0] == 3 && $hunter[1] == 1
               ) $hunterMethod = 'hunterLeftAngleUp';
        else $hunterMethod = 'hunterLeft';



    } else if ( ($dinoParam[0] == 2 && $dinoParam[1] == 0) || ($dinoParam[0] == 3 && $dinoParam[1] == 1) ) {

        if ($hunter[0] == 0 && $hunter[1] == 0) $hunterMethod = 'hunterRightDown';
        else if ($hunter[0] == 1 && $hunter[1] == 0) $hunterMethod = 'hunterLeftDown';
        else if ($hunter[0] == 2 && $hunter[1] == 0 ||
                 $hunter[0] == 3 && $hunter[1] == 0 ||
                 $hunter[0] == 4 && $hunter[1] == 0
                ) $hunterMethod = 'hunterLeftAngleDown';
        else if ($hunter[0] == 2 && $hunter[1] == 1 ||
                 $hunter[0] == 3 && $hunter[1] == 1 ||
                 $hunter[0] == 4 && $hunter[1] == 1 ||
                 $hunter[0] == 4 && $hunter[1] == 2
        ) $hunterMethod = 'hunterLeft';
        else if ($hunter[0] == 2 && $hunter[1] == 2 ||
                 $hunter[0] == 3 && $hunter[1] == 2
                ) $hunterMethod = 'hunterLeftAngleUp';



    } else if (($dinoParam[0] == 4 && $dinoParam[1] == 0) || ($dinoParam[0] == 5 && $dinoParam[1] == 1) ) {

        if ($hunter[0] == 4 && $hunter[1] == 2) $hunterMethod = 'hunterLeftUp';
        else if ($hunter[0] == 3 && $hunter[1] == 2) $hunterMethod = 'hunterRightUp';
        else if ($hunter[0] == 2 && $hunter[1] == 2 ||
                 $hunter[0] == 1 && $hunter[1] == 2 ||
                 $hunter[0] == 0 && $hunter[1] == 2 ||
                 $hunter[0] == 2 && $hunter[1] == 1 ||
                 $hunter[0] == 1 && $hunter[1] == 1
                ) $hunterMethod = 'hunterRightAngleUp';
        else $hunterMethod = 'hunterRight';


    } else  {
        if ($hunter[0] == 4 && $hunter[1] == 0) $hunterMethod = 'hunterLeftDown';
        else if ($hunter[0] == 3 && $hunter[1] == 0) $hunterMethod = 'hunterRightDown';
        else if ($hunter[0] == 2 && $hunter[1] == 0 ||
                 $hunter[0] == 1 && $hunter[1] == 0 ||
                 $hunter[0] == 0 && $hunter[1] == 0
                )  $hunterMethod = 'hunterRightAngleDown';
        else if ($hunter[0] == 2 && $hunter[1] == 1 ||
                 $hunter[0] == 1 && $hunter[1] == 1 ||
                 $hunter[0] == 0 && $hunter[1] == 1
                ) $hunterMethod = 'hunterRight';
        else if ($hunter[0] == 2 && $hunter[1] == 2 ||
                 $hunter[0] == 1 && $hunter[1] == 2
                ) $hunterMethod = 'hunterRightAngleUp';
        else $hunterMethod = 'hunterRight';
    }

   return $hunterMethod;
}

function symbToNumb($symbol) {
    $numb = false;

    switch ($symbol) {
        case 'dino':
            $numb = 0;
            break;
        case 'dog':
            $numb = 1;
            break;
        case 'goggles':
            $numb = 2;
            break;
        case 'gun':
            $numb = 3;
            break;
        case 'hunter':
            $numb  = 4;
            break;
        case 'pipe':
            $numb = 5;
            break;
        case 'A':
            $numb = 6;
            break;
        case 'K':
            $numb = 7;
            break;
        case 'Q':
            $numb = 8;
            break;
        case 'J':
            $numb = 9;
            break;
    }

    return $numb;
}

function preSymb($numbSymb, $reelIndex) {
    global $originalReel;
    if ($numbSymb == 0)  return count($originalReel[$reelIndex]) - 1;
    else return $numbSymb - 1;
}

function postSymb($numbSymb, $reelIndex) {
    global $originalReel;
    if ($numbSymb == count($originalReel[$reelIndex])- 1) return 0;
    else return $numbSymb + 1;
}

function detectDino($matrix) {
    $dinoLeft = false;
    for ($i = 0; $i < count($matrix[0]); $i++) if ($matrix[0][$i] == 'dino') $dinoLeft = [0, $i];

    $dinoRight = false;
    for ($i = 0; $i < count($matrix[4]); $i++) if ($matrix[4][$i] == 'dino') $dinoRight = [4, $i];

    if(!$dinoLeft && !$dinoRight) return false;
    else return [$dinoLeft, $dinoRight];
}

function detectHunter($matrix, $reverse = false) {
    $isHunter = [];

    if ($reverse) {
        for ($i = count($matrix); $i > 0; $i--) {
            for ($k = 0; $k < count($matrix[$i-1]); $k++) if ($matrix[$i-1][$k] == 'hunter') array_push($isHunter, [$i-1, $k]);
        }
    } else {
        for ($i = 0; $i < count($matrix); $i++) {
            for ($k = 0; $k < count($matrix[$i]); $k++) if ($matrix[$i][$k] == 'hunter')  array_push($isHunter, [$i, $k]);
        }
    }

    if (count($isHunter)) return $isHunter;
    else return false;
}

function getWhiteHunter($hunter, $dino) {
    $whiteHunter = false;

    foreach($hunter as $oneHunter) {
        if (!isBlackHunter($oneHunter, $dino)) {
            $whiteHunter = $oneHunter;
            break;
        }
    }

    return $whiteHunter;
}

function isBlackHunter ($hunter, $dino) {

    $blackCoord = [];
    if ($dino[0] == 0 && $dino[1] == 0)  array_push($blackCoord, [1, 0], [1, 1]);
    else if ($dino[0] == 0 && $dino[1] == 1) array_push($blackCoord, [1, 1]);
    else if ($dino[0] == 0 && $dino[1] == 2) array_push($blackCoord, [1, 2], [1, 1]);
    else if ($dino[0] == 4 && $dino[1] == 0) array_push($blackCoord, [3, 0], [3, 1]);
    else if ($dino[0] == 4 && $dino[1] == 1) array_push($blackCoord, [3, 1]);
    else if ($dino[0] == 4 && $dino[1] == 2) array_push($blackCoord, [3, 2], [3, 1]);

    $find = false;
    foreach ($blackCoord as $black) if ($hunter[0] == $black[0] && $hunter[1] == $black[1]) $find = true;

    return $find;
}

function getExtDino($dino, $hunter) {

    if ($dino[0] == 0 && $dino[1] == 0) $dinoExt = [[[1, 0], [1, 1], [0, 1]], [1, 0]];
    else if ($dino[0] == 0 && $dino[1] == 1) {

        if (($hunter[0] == 1 && $hunter[1] == 0) || ($hunter[0] == 0 && $hunter[1] == 0)) $dinoExt = [[[0, 2], [1, 2], [1, 1]], [2, 0]];
        else $dinoExt = [[[0, 0], [1, 0], [1, 1]], [2, 1]];

    } else if ($dino[0] == 0 && $dino[1] == 2)  $dinoExt = [[[0, 1], [1, 1], [1, 2]], [3, 1]];
    else if ($dino[0] == 4 && $dino[1] == 0) $dinoExt = [[[3, 0], [3, 1], [4, 1]], [4, 0]];
    else if ($dino[0] == 4 && $dino[1] == 1) {

        if (($hunter[0] == 3 && $hunter[1] == 0) || ($hunter[0] == 4 && $hunter[1] == 0)) $dinoExt = [[[3, 1], [3, 2], [4, 2]], [5, 0]];
        else $dinoExt = [[[4, 0], [3, 0], [3, 1]], [5, 1]];

    } else $dinoExt = [[[3, 2], [3, 1], [4, 1]], [6, 1]];

    return $dinoExt;
}

function getMatrixSymbol($extDino, $x, $y, $matrix) {
    $matrixSymbol = false;
    if ($extDino) $matrixSymbol = tryGetDinoExtSymbol($extDino, $x, $y);
    if (!$matrixSymbol) $matrixSymbol = $matrix[$x][$y];
    return $matrixSymbol;
}

function tryGetDinoExtSymbol($extDino, $x, $y) {
    $result = false;
    foreach ($extDino as $item) foreach ($item[0] as $elm) if ($x == $elm[0] && $y == $elm[1]) $result = 'dino';
    return $result;
}