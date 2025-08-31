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



    if ($language == "mysql") {
        // Ensure the MySQL command is correct and accessible
$output = shell_exec("D:\\server\\mysql\\bin\\mysql.exe $filePathEscaped 2>&1");
        echo $output;
        
    }


  if ($language == "mysql") {
    $username = "root";
    $password = "123"; // Set your MySQL password here
    $database = "test";

    // Read code from POST
    $sqlCode = $_POST['code'];

    // Auto-drop table if it tries to create one
    if (preg_match('/CREATE\s+TABLE\s+`?(\w+)`?/i', $sqlCode, $matches)) {
        $tableName = $matches[1];
        $dropLine = "DROP TABLE IF EXISTS `$tableName`;\n";
        $sqlCode = $dropLine . $sqlCode;
    }

    // Create .sql file
    $sqlFile = $filePath . ".sql";
    file_put_contents($sqlFile, $sqlCode);
    $filePathEscaped = escapeshellarg($sqlFile);

    // Run MySQL command
$command = "D:\\server\\mysql\\bin\\mysql.exe -u root $database < $filePathEscaped 2>&1";
    $output = shell_exec($command);

    
    echo $output;

    // Cleanup
    if (file_exists($sqlFile)) unlink($sqlFile);
}



elseif ($language == "prolog") {
    $prologPath = "C:\\Program Files\\swipl\\bin\\swipl.exe";

    if (!empty($input)) {
        // Write user input into a temporary file
        $tempFile = tempnam(sys_get_temp_dir(), 'prolog_') . '.pl';
        file_put_contents($tempFile, $input);
        $filePathEscaped = escapeshellarg($tempFile);

        $output = shell_exec("\"$prologPath\" -s $filePathEscaped 2>&1");

        unlink($tempFile); // Clean up after running
    } else {
        // Fallback: run from existing file
        $filePathEscaped = escapeshellarg($filePath);
        $output = shell_exec("\"$prologPath\" -s $filePathEscaped 2>&1");
    }

    echo $output;
}

elseif ($language == "r") {
    $rPath = "C:\\Program Files\\R\\R-4.5.1\\bin\\Rscript.exe";

    if (!empty($input)) {
        // Write user input into a temporary file
        $tempFile = tempnam(sys_get_temp_dir(), 'r_') . '.R';
        file_put_contents($tempFile, $input);
        $filePathEscaped = escapeshellarg($tempFile);

        $output = shell_exec("\"$rPath\" $filePathEscaped 2>&1");

        unlink($tempFile); // Clean up after running
    } else {
        // Fallback: run from existing file
        $filePathEscaped = escapeshellarg($filePath);
        $output = shell_exec("\"$rPath\" $filePathEscaped 2>&1");
    }

    echo $output;
}

elseif ($language == "go") {
    $goPath = "\"C:\\Program Files\\Go\\bin\\go.exe\"";

    if (!empty($input)) {
        // Save input to a temporary .go file
        $tempFile = tempnam(sys_get_temp_dir(), 'go_') . '.go';
        file_put_contents($tempFile, $input);
        $filePathEscaped = escapeshellarg($tempFile);

        // Run the Go program
        $output = shell_exec("$goPath run $filePathEscaped 2>&1");

        unlink($tempFile); // Clean up
    } else {
        // Fallback to file upload/run
        $filePathEscaped = escapeshellarg($filePath);
        $output = shell_exec("$goPath run $filePathEscaped 2>&1");
    }

    echo $output;
}



if ($language == "groovy") {
$groovyPath = "groovy"; // Use global command

    if (!empty($input)) {
        $tempFile = tempnam(sys_get_temp_dir(), 'groovy_') . '.groovy';
        file_put_contents($tempFile, $input);
        $filePathEscaped = escapeshellarg($tempFile);

        $command = $groovyPath . " " . $filePathEscaped . " 2>&1";
        $output = shell_exec($command);

        unlink($tempFile);
    } else {
        $filePathEscaped = escapeshellarg($filePath);
        $command = $groovyPath . " " . $filePathEscaped . " 2>&1";
        $output = shell_exec($command);
    }

    echo $output;
}
if ($language == "csharp") {
    $dotnet = "\"C:\\Program Files\\dotnet\\dotnet.exe\"";

    if (!empty($code)) {
        $tempDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . uniqid("csharp_proj_");
        mkdir($tempDir);

        // Create project
        shell_exec("$dotnet new console -o \"$tempDir\" --force");

        // Overwrite Program.cs with user code
        $programPath = $tempDir . DIRECTORY_SEPARATOR . "Program.cs";
        file_put_contents($programPath, $code);

        // Build & run
        $runCommand = "$dotnet run --project \"$tempDir\" 2>&1";
        $output = shell_exec($runCommand);

        echo $output;

        // Clean up
        shell_exec("rd /s /q " . escapeshellarg($tempDir));
    } else {
        echo "Error: No code provided.";
    }
}


 elseif ($language == "python") {
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



//for ruby
if ($language == "rubby") {

$rubyPath = "\"C:\\Users\\HP\\scoop\\apps\\ruby\\current\\bin\\ruby.exe\""; // Properly quoted

if (!empty($code)) {
    $tempFile = tempnam(sys_get_temp_dir(), 'ruby_') . '.rb';
    file_put_contents($tempFile, $code);

    if (!empty($input)) {
        $inputEscaped = escapeshellarg($input);
        $command = "echo $inputEscaped | $rubyPath " . escapeshellarg($tempFile) . " 2>&1";
    } else {
        $command = "$rubyPath " . escapeshellarg($tempFile) . " 2>&1";
    }

    $output = shell_exec($command);
    echo $output;
    unlink($tempFile);
}
}
if ($_POST['language'] == "html") {
    $code = $_POST['code'];

    // just return the code as-is
    echo $code;
    exit;
}





?>
