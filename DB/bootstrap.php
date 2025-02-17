<?php
session_start();

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');

$dotenv->load();

error_reporting(E_ALL);
ini_set('display_errors', $_ENV['APP_ENV'] === 'development' ? 1 : 0);

// Set timezone
date_default_timezone_set('EST');

// Load configuration files
require_once __DIR__ . '/database.php';

$dotenv->required([
    'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS',
    'GOOGLE_API_KEY', 'NUTRITION_API_KEY'
]);