<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);

    echo json_encode([
        'error' => 'Méthode non autorisée'
    ]);

    exit;
}

$data = file_get_contents('php://input');
$pokemon = json_decode($data, true);

if (
    !is_array($pokemon) ||
    !isset($pokemon['id']) ||
    !is_numeric($pokemon['id']) ||
    (int) $pokemon['id'] <= 0
) {
    http_response_code(400);

    echo json_encode([
        'error' => 'Identifiant du Pokémon invalide'
    ]);

    exit;
}

require_once 'database.php';

$sql = 'DELETE FROM pokemons WHERE id = :id';
$stmt = $pdo->prepare($sql);

$stmt->execute([
    'id' => (int) $pokemon['id']
]);

if ($stmt->rowCount() === 0) {
    http_response_code(404);

    echo json_encode([
        'error' => 'Pokémon introuvable dans la collection'
    ]);

    exit;
}

echo json_encode([
    'message' => 'Pokémon supprimé avec succès'
]);