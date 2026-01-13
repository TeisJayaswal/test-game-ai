using UnityEngine;
using Normal.Realtime;

/// <summary>
/// Spawns a player when we connect to a room.
/// The player prefab must be in the Resources folder.
/// </summary>
public class PlayerSpawner : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private Realtime _realtime;

    [Header("Spawn Settings")]
    [SerializeField] private string playerPrefabName = "Player";
    [SerializeField] private float spawnRadius = 3f;
    [SerializeField] private float spawnHeight = 1f;

    private void Awake()
    {
        if (_realtime == null)
        {
            _realtime = FindObjectOfType<Realtime>();
        }

        _realtime.didConnectToRoom += OnConnectedToRoom;
    }

    private void OnDestroy()
    {
        if (_realtime != null)
        {
            _realtime.didConnectToRoom -= OnConnectedToRoom;
        }
    }

    private void OnConnectedToRoom(Realtime realtime)
    {
        // Spawn player at random position within spawn radius
        Vector3 spawnPos = new Vector3(
            Random.Range(-spawnRadius, spawnRadius),
            spawnHeight,
            Random.Range(-spawnRadius, spawnRadius)
        );

        // Instantiate the player with ownership
        Realtime.Instantiate(
            prefabName: playerPrefabName,
            position: spawnPos,
            rotation: Quaternion.identity,
            ownedByClient: true,
            preventOwnershipTakeover: true,
            useInstance: realtime
        );

        Debug.Log($"Player spawned at {spawnPos}");
    }
}
