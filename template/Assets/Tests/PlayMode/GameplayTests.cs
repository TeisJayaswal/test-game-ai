using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using UnityEngine.SceneManagement;
using UnityEngine.InputSystem;

/// <summary>
/// Example gameplay tests demonstrating TDD patterns for Unity games.
/// Claude can use these as templates for testing specific game features.
///
/// Test naming convention: Thing_Condition_ExpectedResult
/// </summary>
public class GameplayTests : InputTestFixture
{
    private const string GAME_SCENE = "Game"; // Update to your main scene name

    #region Setup and Teardown

    [SetUp]
    public override void Setup()
    {
        base.Setup(); // Important: Call base for InputTestFixture
    }

    [TearDown]
    public override void TearDown()
    {
        base.TearDown();
    }

    #endregion

    #region Player Existence Tests

    [UnityTest]
    public IEnumerator Player_ExistsInScene_WhenGameStarts()
    {
        yield return LoadGameScene();

        var player = GameObject.FindWithTag("Player");

        Assert.IsNotNull(player, "Player should exist in the game scene");
    }

    [UnityTest]
    public IEnumerator Player_HasRequiredComponents_WhenSpawned()
    {
        yield return LoadGameScene();

        var player = GameObject.FindWithTag("Player");
        Assert.IsNotNull(player, "Player must exist");

        // Check essential components
        Assert.IsNotNull(player.GetComponent<Rigidbody>() ?? player.GetComponent<Rigidbody2D>() as Component,
            "Player should have a Rigidbody or Rigidbody2D");
        Assert.IsNotNull(player.GetComponent<Collider>() ?? player.GetComponent<Collider2D>() as Component,
            "Player should have a Collider or Collider2D");
    }

    #endregion

    #region Position Tests

    [UnityTest]
    public IEnumerator Player_SpawnsAboveGround_WhenGameStarts()
    {
        yield return LoadGameScene();

        var player = GameObject.FindWithTag("Player");
        Assert.IsNotNull(player, "Player must exist");

        // Player should not be below y=0 (typical ground level)
        Assert.GreaterOrEqual(player.transform.position.y, 0f,
            "Player should spawn at or above ground level");
    }

    #endregion

    #region Movement Tests (Input Simulation)

    [UnityTest]
    public IEnumerator Player_MovesRight_WhenDKeyPressed()
    {
        yield return LoadGameScene();

        var keyboard = InputSystem.AddDevice<Keyboard>();
        var player = GameObject.FindWithTag("Player");
        Assert.IsNotNull(player, "Player must exist");

        float startX = player.transform.position.x;

        // Press D key for half a second
        Press(keyboard.dKey);
        yield return new WaitForSeconds(0.5f);
        Release(keyboard.dKey);

        // Player should have moved right (positive X)
        Assert.Greater(player.transform.position.x, startX,
            "Player should move right when D key is pressed");
    }

    [UnityTest]
    public IEnumerator Player_MovesLeft_WhenAKeyPressed()
    {
        yield return LoadGameScene();

        var keyboard = InputSystem.AddDevice<Keyboard>();
        var player = GameObject.FindWithTag("Player");
        Assert.IsNotNull(player, "Player must exist");

        float startX = player.transform.position.x;

        Press(keyboard.aKey);
        yield return new WaitForSeconds(0.5f);
        Release(keyboard.aKey);

        Assert.Less(player.transform.position.x, startX,
            "Player should move left when A key is pressed");
    }

    [UnityTest]
    public IEnumerator Player_Jumps_WhenSpacePressed()
    {
        yield return LoadGameScene();

        var keyboard = InputSystem.AddDevice<Keyboard>();
        var player = GameObject.FindWithTag("Player");
        Assert.IsNotNull(player, "Player must exist");

        // Wait for player to be grounded
        yield return new WaitForSeconds(0.5f);
        float startY = player.transform.position.y;

        // Press space to jump
        PressAndRelease(keyboard.spaceKey);
        yield return new WaitForSeconds(0.3f);

        Assert.Greater(player.transform.position.y, startY,
            "Player should move up when Space is pressed (jump)");
    }

    #endregion

    #region Collectible Tests

    [UnityTest]
    public IEnumerator Collectible_DisappearsWhenPlayerTouches()
    {
        yield return LoadGameScene();

        var collectibles = GameObject.FindGameObjectsWithTag("Collectible");
        if (collectibles.Length == 0)
        {
            // Also try "Coin" tag
            collectibles = GameObject.FindGameObjectsWithTag("Coin");
        }

        // Skip test if no collectibles in scene
        if (collectibles.Length == 0)
        {
            Assert.Ignore("No collectibles found in scene - test skipped");
            yield break;
        }

        var player = GameObject.FindWithTag("Player");
        Assert.IsNotNull(player, "Player must exist");

        int initialCount = collectibles.Length;
        var firstCollectible = collectibles[0];
        Vector3 collectiblePos = firstCollectible.transform.position;

        // Move player to collectible position
        player.transform.position = collectiblePos;

        // Wait for physics/trigger detection
        yield return new WaitForFixedUpdate();
        yield return new WaitForFixedUpdate();
        yield return new WaitForSeconds(0.1f);

        // Re-count collectibles
        var remainingCollectibles = GameObject.FindGameObjectsWithTag("Collectible");
        if (remainingCollectibles.Length == initialCount)
        {
            remainingCollectibles = GameObject.FindGameObjectsWithTag("Coin");
        }

        Assert.Less(remainingCollectibles.Length, initialCount,
            "Collectible should be removed when player touches it");
    }

    #endregion

    #region Enemy Tests

    [UnityTest]
    public IEnumerator Enemy_ExistsInScene_WhenGameStarts()
    {
        yield return LoadGameScene();

        var enemies = GameObject.FindGameObjectsWithTag("Enemy");

        // This test passes if enemies exist, or is inconclusive if game has no enemies
        if (enemies.Length == 0)
        {
            Assert.Ignore("No enemies in scene - test skipped");
        }
        else
        {
            Assert.Greater(enemies.Length, 0, "Enemies should exist in the game");
        }
    }

    #endregion

    #region UI Tests

    [UnityTest]
    public IEnumerator UI_ScoreExists_WhenGameStarts()
    {
        yield return LoadGameScene();

        // Look for common score UI patterns
        var scoreObj = GameObject.Find("ScoreText") ??
                      GameObject.Find("Score") ??
                      GameObject.Find("ScoreUI");

        if (scoreObj == null)
        {
            Assert.Ignore("No score UI found - test skipped");
            yield break;
        }

        Assert.IsNotNull(scoreObj, "Score UI should exist");
    }

    #endregion

    #region Helper Methods

    /// <summary>
    /// Load the main game scene and wait for it to initialize.
    /// </summary>
    private IEnumerator LoadGameScene()
    {
        // Check if scene exists before loading
        AsyncOperation loadOp = SceneManager.LoadSceneAsync(GAME_SCENE);
        if (loadOp == null)
        {
            Assert.Fail($"Scene '{GAME_SCENE}' could not be loaded. Make sure it's added to Build Settings.");
            yield break;
        }

        yield return loadOp;

        // Wait an extra frame for objects to initialize
        yield return null;
    }

    /// <summary>
    /// Helper to check if a position is approximately equal to expected.
    /// </summary>
    private void AssertPositionApproximate(Vector3 actual, Vector3 expected, float tolerance = 0.1f, string message = "")
    {
        Assert.AreEqual(expected.x, actual.x, tolerance, $"{message} X position mismatch");
        Assert.AreEqual(expected.y, actual.y, tolerance, $"{message} Y position mismatch");
        Assert.AreEqual(expected.z, actual.z, tolerance, $"{message} Z position mismatch");
    }

    #endregion
}
