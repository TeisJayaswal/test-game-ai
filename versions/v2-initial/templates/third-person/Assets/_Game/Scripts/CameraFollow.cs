using UnityEngine;
using Normal.Realtime;

/// <summary>
/// Third-person camera that follows the local player.
/// Automatically finds the local player when they spawn.
/// </summary>
public class CameraFollow : MonoBehaviour
{
    [Header("Follow Settings")]
    [SerializeField] private Vector3 offset = new Vector3(0, 5, -7);
    [SerializeField] private float smoothSpeed = 5f;
    [SerializeField] private float lookAheadDistance = 2f;

    private Transform _target;

    private void LateUpdate()
    {
        // If we don't have a target, try to find our local player
        if (_target == null)
        {
            FindLocalPlayer();
            return;
        }

        // Calculate desired position
        Vector3 lookAhead = _target.forward * lookAheadDistance;
        Vector3 desiredPosition = _target.position + _target.TransformDirection(offset);

        // Smoothly move camera
        transform.position = Vector3.Lerp(transform.position, desiredPosition, smoothSpeed * Time.deltaTime);

        // Look at player (with some look-ahead)
        transform.LookAt(_target.position + lookAhead + Vector3.up);
    }

    private void FindLocalPlayer()
    {
        // Find all RealtimeViews and look for our local player
        RealtimeView[] views = FindObjectsOfType<RealtimeView>();

        foreach (var view in views)
        {
            if (view.isOwnedLocallyInHierarchy && view.GetComponent<PlayerController>() != null)
            {
                _target = view.transform;
                Debug.Log("Camera found local player");
                return;
            }
        }
    }
}
