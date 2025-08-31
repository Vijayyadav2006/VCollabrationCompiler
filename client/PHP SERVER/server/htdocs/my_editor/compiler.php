<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $language = strtolower($_POST['language']);
    $code = $_POST['code'];
    $input = $_POST['input']; // Get the user input

    $random = substr(md5(mt_rand()), 0, 7);
    $filePath = "temp/" . $random . "." . $language;

    // Ensure the temp directory exists and has the correct permissions
    if (!file_exists('temp')) {
        mkdir('temp', 0777, true);
    }

    $programFile = fopen($filePath, "w");
    if ($programFile === false) {
        echo "Error: Unable to create file.";
        exit;
    }
    fwrite($programFile, $code);
    fclose($programFile);

    // Sanitize file path to avoid shell injection
    $filePathEscaped = escapeshellarg($filePath);

    if ($language == "php") {
        $output = shell_exec("D:\server\php\\php.exe $filePathEscaped 2>&1");
        echo $output;
    } elseif ($language == "python") {
        if ($input) {
            $output = shell_exec("echo " . escapeshellarg($input) . " | C:\\TurboC++\\Python\\Python312\\python.exe $filePathEscaped 2>&1");
        } else {
            $output = shell_exec("C:\\TurboC++\\Python\\Python312\\python.exe $filePathEscaped 2>&1");
        }
        echo $output;
    } elseif ($language == "node") {
        rename($filePath, $filePath . ".js");
        if ($input) {
            $output = shell_exec("echo " . escapeshellarg($input) . " | node $filePathEscaped.js 2>&1");
        } else {
            $output = shell_exec("node $filePathEscaped.js 2>&1");
        }
        echo $output;
    } elseif ($language == "c") {
        // Generate a random output executable name
        $outputExe = $random . ".exe";

        // Compile the C file
        $compileCommand = "gcc " . escapeshellarg($filePath) . " -o " . escapeshellarg($outputExe);
        $compileOutput = shell_exec($compileCommand . " 2>&1");

        // Check if there are compilation errors
        if (strpos($compileOutput, "error") === false) {
            // Execute the compiled executable
            if ($input) {
                $output = shell_exec("echo " . escapeshellarg($input) . " | " . escapeshellarg($outputExe) . " 2>&1");
            } else {
                $output = shell_exec(escapeshellarg($outputExe) . " 2>&1");
            }
            echo $output;
        } else {
            // Output the compilation errors
            echo "Compilation Error: \n" . $compileOutput;
        }
    } elseif ($language == "cpp") {
        // Generate a random output executable name
        $outputExe = $random . ".exe";

        // Define the full path to TDM-GCC's g++ compiler
        $gppPath = "C:\\TDM-GCC-64\\bin\\g++";

        // Compile the C++ file
        $compileCommand = $gppPath . " " . escapeshellarg($filePath) . " -o " . escapeshellarg(__DIR__ . "\\" . $outputExe);
        $compileOutput = shell_exec($compileCommand . " 2>&1");

        // Check for compilation errors
        if (strpos($compileOutput, "error") === false) {
            // Execute the compiled executable
            if ($input) {
                $output = shell_exec("echo " . escapeshellarg($input) . " | " . escapeshellarg(__DIR__ . "\\" . $outputExe) . " 2>&1");
            } else {
                $output = shell_exec(escapeshellarg(__DIR__ . "\\" . $outputExe) . " 2>&1");
            }
            echo $output;
        } else {
            // Output compilation errors
            echo "Compilation Error: \n" . $compileOutput;
        }

        // Optional: Clean up the executable file after execution
        if (file_exists(__DIR__ . "\\" . $outputExe)) {
            unlink(__DIR__ . "\\" . $outputExe);
        }
    } elseif ($language == "java") {
        $output = shell_exec("D:\\java_compiler\\jdk-23.0.1\\bin\\javac.exe $filePathEscaped 2>&1");
        echo $output;
    }

    // Clean up temporary code file after execution
    if (file_exists($filePath)) {
        unlink($filePath);
    }
}
?>
