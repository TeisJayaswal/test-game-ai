using UnityEngine;
using UnityEngine.UI;
using TMPro;
using Normal.Realtime;

/// <summary>
/// UI for joining and creating multiplayer rooms.
/// Shows a simple menu where players can enter a room code.
/// </summary>
public class RoomManager : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private Realtime _realtime;

    [Header("UI Elements")]
    [SerializeField] private TMP_InputField _roomCodeInput;
    [SerializeField] private Button _joinButton;
    [SerializeField] private Button _createButton;
    [SerializeField] private GameObject _menuPanel;
    [SerializeField] private TMP_Text _statusText;

    private void Start()
    {
        if (_realtime == null)
        {
            _realtime = FindObjectOfType<Realtime>();
        }

        // Set up button listeners
        if (_joinButton != null)
        {
            _joinButton.onClick.AddListener(JoinRoom);
        }

        if (_createButton != null)
        {
            _createButton.onClick.AddListener(CreateRoom);
        }

        // Listen for connection events
        _realtime.didConnectToRoom += OnConnected;
        _realtime.didDisconnectFromRoom += OnDisconnected;
    }

    private void OnDestroy()
    {
        if (_realtime != null)
        {
            _realtime.didConnectToRoom -= OnConnected;
            _realtime.didDisconnectFromRoom -= OnDisconnected;
        }
    }

    /// <summary>
    /// Join an existing room with the entered code.
    /// </summary>
    public void JoinRoom()
    {
        string roomCode = _roomCodeInput.text.ToUpper().Trim();

        if (string.IsNullOrEmpty(roomCode))
        {
            SetStatus("Enter a room code!");
            return;
        }

        SetStatus($"Joining room {roomCode}...");
        _realtime.Connect(roomCode);
    }

    /// <summary>
    /// Create a new room with a random code.
    /// </summary>
    public void CreateRoom()
    {
        string roomCode = GenerateRoomCode();
        _roomCodeInput.text = roomCode;
        SetStatus($"Creating room {roomCode}...");
        _realtime.Connect(roomCode);
    }

    private void OnConnected(Realtime realtime)
    {
        SetStatus($"Connected to room: {realtime.room.name}");

        // Hide the menu
        if (_menuPanel != null)
        {
            _menuPanel.SetActive(false);
        }
    }

    private void OnDisconnected(Realtime realtime)
    {
        SetStatus("Disconnected");

        // Show the menu again
        if (_menuPanel != null)
        {
            _menuPanel.SetActive(true);
        }
    }

    private void SetStatus(string message)
    {
        if (_statusText != null)
        {
            _statusText.text = message;
        }
        Debug.Log($"[RoomManager] {message}");
    }

    /// <summary>
    /// Generate a random 4-character room code.
    /// Uses characters that are easy to read and type.
    /// </summary>
    private string GenerateRoomCode()
    {
        // Exclude characters that look similar (0/O, 1/I/L)
        const string chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        char[] code = new char[4];

        for (int i = 0; i < 4; i++)
        {
            code[i] = chars[Random.Range(0, chars.Length)];
        }

        return new string(code);
    }
}
