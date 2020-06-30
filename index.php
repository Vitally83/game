<?php
session_start();
session_unset();
$_SESSION['mark'] = time();
$_SESSION['balance'] = 2000;
$_SESSION['fullTankLevel'] = [[], []];
$_SESSION['freeSpinTankLevel'] = [['level'=> 0, 'action' => false], ['level'=> 0, 'action' => false]];
$_SESSION['freeSpin'] = false;
?>

<!DOCTYPE html>
<html style="width: 100%; height: 100%;" lang="ru">
<head>
    <style>* {padding: 0; margin: 0}</style>
    <meta charset="UTF-8">

    <link href='main.css' rel='stylesheet'  type='text/css'/>
    <script src="js/fontfaceobserver.js"> </script>
    <script src="js/pixi.min.js"> </script>
    <script src="js/pixi.min.js"> </script>
    <script src="js/soundjs.min.js"> </script>
    <script src="js/main.js"></script>

    <title>London Hunter</title>
</head>
<body id="<?=$_SESSION['mark']?>" style="width: 100%; height: 100%; overflow: hidden; background: rgb(0,0,0);" >

</body> 
</html>