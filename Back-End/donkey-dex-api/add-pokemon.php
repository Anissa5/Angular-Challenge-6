<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$data = file_get_contents('php://input');
$pokemon = json_decode($data, true);

if (
    !is_array($pokemon) ||
    !isset($pokemon['pokemon_api_id'], $pokemon['name']) ||
    !is_numeric($pokemon['pokemon_api_id']) ||
    !is_string($pokemon['name']) ||
    trim($pokemon['name']) === '' ||
    (int) $pokemon['pokemon_api_id'] <= 0
) {
    http_response_code(400);

    echo json_encode([
        'error' => 'Données du Pokémon invalides'
    ]);

    exit;
}

require_once 'database.php';

// Vérifier si le Pokémon est déjà dans la collection
$checkSql = 'SELECT id
             FROM pokemons
             WHERE pokemon_api_id = :pokemon_api_id';

$checkStmt = $pdo->prepare($checkSql);

$checkStmt->execute([
    'pokemon_api_id' => (int) $pokemon['pokemon_api_id']
]);

if ($checkStmt->fetch()) {
    echo json_encode([
        'message' => 'Ce Pokémon est déjà dans ta collection',
        'already_exists' => true
    ]);

    exit;
}

$sql = 'INSERT INTO pokemons (pokemon_api_id, name)
        VALUES (:pokemon_api_id, :name)';

$stmt = $pdo->prepare($sql);

$stmt->execute([
    'pokemon_api_id' => (int) $pokemon['pokemon_api_id'],
    'name' => trim($pokemon['name'])
]);

http_response_code(201);

echo json_encode([
    'message' => 'Pokémon ajouté avec succès',
    'id' => $pdo->lastInsertId()
]);