<?php
require_once __DIR__ . '/bootstrap.php';

$request = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];


try 
{
    switch (true) 
	{
        case preg_match('/^\/api\/recipes$/', $request):
            require __DIR__ . '/recipes.php';
            break;
            
        case preg_match('/^\/api\/auth/', $request):
            require __DIR__ . '/auth.php';
            break;
            
        case preg_match('/^\/api\/search/', $request):
            require __DIR__ . '/search.php';
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Not Found']);
            break;
    }
} 
catch (Exception $e) 
{
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
