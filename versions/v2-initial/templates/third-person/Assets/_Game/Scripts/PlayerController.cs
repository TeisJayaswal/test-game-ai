using UnityEngine;
using Normal.Realtime;

/// <summary>
/// Controls player movement. Only runs for the local player.
/// Movement is synced to other players via RealtimeTransform.
/// </summary>
public class PlayerController : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private float rotateSpeed = 120f;
    [SerializeField] private float gravity = -9.81f;

    private RealtimeView _realtimeView;
    private CharacterController _controller;
    private float _verticalVelocity;

    private void Awake()
    {
        _realtimeView = GetComponent<RealtimeView>();
        _controller = GetComponent<CharacterController>();
    }

    private void Update()
    {
        // Only control our own player
        if (!_realtimeView.isOwnedLocallyInHierarchy) return;

        HandleMovement();
    }

    private void HandleMovement()
    {
        // Get input
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");

        // Rotate left/right with A/D
        transform.Rotate(0, horizontal * rotateSpeed * Time.deltaTime, 0);

        // Move forward/backward with W/S
        Vector3 move = transform.forward * vertical * moveSpeed;

        // Apply gravity
        if (_controller.isGrounded)
        {
            _verticalVelocity = -2f; // Small downward force to stay grounded
        }
        else
        {
            _verticalVelocity += gravity * Time.deltaTime;
        }

        move.y = _verticalVelocity;
        _controller.Move(move * Time.deltaTime);
    }
}
