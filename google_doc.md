[Unity Vibe Coding Agent]{.underline}

Technical and Go-To-Market PRD

[What It Is]{.underline}

A command-line utility to make it easy to build Unity games with Claude
Code.

[Problem & Value]{.underline}

Problems solved:

-   Non-technical users can build games

-   Removes a lot of the boilerplate for experienced developers and
    > makes it easier to build prototypes/remove some of the grunt work.

-   Claude chooses Normcore as the networking solution, improving
    > Normcore's visibility among vibe coders.

Target Users

1.  Non-technical creators -- Artists, designers with game ideas but no
    > coding experience

2.  Rapid prototypers -- Developers who want to test concepts quickly
    > before full commitment

3.  Learners -- People learning Unity who want a pair programmer

4.  Actual Game Devs - We're building real stuff at Normal and using
    > Claude Code to build real backend stuff. I want that same workflow
    > to be possible with Unity. Maybe not /all/ Unity work, but a lot
    > of it. There's a few parts of the game dev timeline I think it
    > will be great at:

    a.  Early quick throwaway prototyping

    b.  Systems code in mature games (NPCs, Networking, etc)

        i.  Code-heavy stuff that's easily testable

    c.  Fixing bugs that don't require Claude to play the game well.

        i.  Systems type bugs or bugs that have solutions that Claude
            > has seen on the internet already.

The Opportunity

Core insight: AI lowers the barrier to game development and rapid
prototyping. Right now there\'s no standard way to vibe-code a Unity
game and we want to build the standard. This means more people building
games and hopefully, more people using Normcore since Claude will
ideally be choosing Normcore for multiplayer.

Core Features

1\. No friction on install/setting up new Unity project

-   npm install -g unity-agent or wget https://normcore.io/unity-agent
    > \| sh

-   unity-agent fresh-project - Creates Unity project, installs MCP
    > server, bootstraps Claude helpers in one command.

2\. Vibe Coding Games

-   Claude parses simple game descriptions into Unity projects. Creates
    > scenes, scripts, physics, input handling, and camera systems
    > automatically.

```{=html}
<!-- -->
```
-   Searches free asset repositories, download and import assets,
    > configure materials and textures, set up audio

```{=html}
<!-- -->
```
-   Automated verification for missing references, compile errors, and
    > visual checks via screenshots. Fixes issues automatically when
    > possible.

Out of Scope (for now)

-   Focus on Claude right now, extend to other models (Gemini, Codex,
    > etc.) later

[First MVP Deliverable]{.underline}

-   A command line utility that you can install from Github

-   Fresh project command that sets up Unity project, installs the MCP
    > server, and sets up the Claude toolkit

-   You can ask Claude to build a new game with a short description of
    > what you want and it tries to build as far as it can in one-go.

[Go-To-Market Strategy]{.underline}

The Goal

Make our toolkit the defacto standard for developers who want to
vibe-code or prototype Unity games quickly. Front page of Hacker News.

Execution Plan

1.  Build the shiniest demo possible -- Something that makes devs go
    > \"holy shit I want to try this.\"

    a.  **[Candidate: Mini golf game and Minecraft replica]{.mark}**

2.  Pair down to simplest steps -- Identify what tools need building.
    > Write blog post about the tools and what we were able to do with
    > the toolkit

3.  Record real videos -- Show the end result. \"Teis as a Unity newbie
    > makes a game from scratch.\"

4.  Launch -- Hacker News + every relevant subreddit.

Hacker News Strategy

-   HN loves Claude Code right now

-   10 upvotes within 30 minutes = front page. Team can seed this.

-   Post needs a unique POV that devs might disagree with

-   Reference: Max\'s contact whose blog hit front page 90 times in 2025

Content Strategy

-   YouTube video: \"Make a Video Game With No Experience\" -- evergreen
    > marketing

-   Youtuber who Max talked to on Thursday, January 15 who has a channel
    > with 100k followers. He wants to try the tool and potentially make
    > content with it

-   Blog post: Technical tutorial with compelling end result

-   Social ads: \"Ever dreamed about building a video game but never
    > learned how?\"

-   Reddit: Post to every relevant subreddit

Call to Action

Every piece of content needs a CTA that lets us reach them again:

-   Install the tool (track downloads)

-   Subscribe to blog/newsletter

-   Star the GitHub repo

-   Ideal: Readers post the NEXT article to HN for us

Definition of Done

-   Demo game that looks production-quality (not amateur Unity grey
    > boxes)

-   One-command install that actually works

-   Blog post written and reviewed

-   YouTube video recorded and edited

-   Template repo public with all Claude helpers

-   Front page of Hacker News

If the above project is successful and we see excitement about the tool
and lots of downloads, we'll continue iterating, talking to users to
figure out what tools/commands to add to the command line utility or in
what ways Claude can be improved. Also, figuring out how to extend to
other coding tools so we don't limit ourselves to Claude users.

## Deliverable Timeline

-   Teis finishes the Minecraft and Golf demos and shows them to Max
    > (Ideally before EOD Tuesday 1/20) - DONE

-   Max does a first draft on the blog post (EOD Wednesday)

    -   Rough out what the key points are that we want to make

    -   What assets are we going to need?

    -   Where are we going to publish it?

    -   What's the call to action?

    -   Notes for Max

        -   Talk about how we see this fitting into people's workflows

            -   Initial prototyping

            -   Systems development

            -   Bugfixes

            -   Lowering the barrier to entry to make games like Lethal
                > Company, Peak, etc

-   Create the command-line utility (EOD Thursday)

    -   What's the architecture of the command-line utility?

        -   Claude code is nodejs wrapped with Bun's build command

            -   This has /tons/ of memory leaks

            -   Is there another alternative?

            -   Do we dare use rust? That's what codex uses.

                -   Max doesn't like to maintain rust.

        -   What can we do that works on Mac and Windows (Windows WSL
            > /and/ powershell)

            -   Claude again uses Bun here I'm pretty sure.

            -   Codex uses rust

            -   Ideally we can build the utility with nodejs and bundle
                > it in a way that isn't too massive and has a fast
                > start-up time.

                -   And can self-update!!

                    -   It's paramount we can add a feature to this tool
                        > and it's instantly available for everyone who
                        > uses the tool.

                    -   How does Claude do this? It seems to be able to
                        > run updates without blocking you on using
                        > Claude Code. We want it to be like that. Maybe
                        > it auto-updates in the background and copies
                        > the new command into place so it can be used
                        > on the next run?

    -   What is the absolute bare minimum feature set we need for this
        > to work:

        -   One-liner command to install it

        -   A command to create a fresh repo in the current directory

            -   Prompt to create a unity project

            -   Prompt to set up the claude commands

        -   A command to create a fresh unity project (If you want to
            > just run it manually and skip the bootstrap that does
            > everything)

            -   Finds all Unity installs, creates the project, installs
                > advanced-mcp?

                -   Would be nice if it auto-configures Claude ~~and
                    > Codex~~ with advanced-mcp. That process was a real
                    > pain in the ass to do manually.

        -   A command to install all of the claude commands (Same deal,
            > useful to run later or to add the commands to an existing
            > repo)

            -   Ideally we put them in a git repo and it's able to just
                > download the latest from the git repo and copy into
                > the .claude folder.

                -   ~~How do we want the command to support updating
                    > these? I expect people may modify them and we
                    > don't want to auto-update over them. Maybe on boot
                    > it can prompt and say "there's new claude commands
                    > available, would you like to upgrade?"~~

                -   ~~Maybe even we just have our claude commands as a
                    > submodule? And we reference them using @
                    > references somehow? Is that possible?~~

                -   Let's not worry about updating them right now, we
                    > can do that when we push the next update. As long
                    > as we can push updates to the command-line
                    > utility, we're future-proof'd there.

    -   These commands need to work on Windows!!!

-   Finalize all blog post assets, put up a git repo for this (End of
    > day Thursday, but this only works if the command-line utility is
    > working by End of day Wednesday)

    -   Do we want to put this repo under \@NormalVR. Max also owns
        > \@normcoreio / \@normcore-io on github. Do want a third thing
        > that's like \@game-agent, so other people feel inclined to
        > contribute to it?

-   Create the Show HN blog post (We can publish this on Friday. That's
    > the best day for Hacker news stuff. However, it is currently
    > Tuesday.)

    -   Consult the post Max found on how to get to the front page

        -   Usually involves a claim that's somewhat divisive.

            -   I can't tell if we should do that, or do "Show HN", the
                > latter feels more positive, but may also get looked
                > over more easily?

-   

The workflow Max imagines:

1.  Use has Claude Code installed on their machine.

2.  They run our custom install command that looks like curl
    > [[github.io/game-agent/tree/latest]{.underline}](http://github.io/game-agent/tree/latest)
    > \| bash

3.  Now they go into a fresh folder and they do something like this:

4.  game-agent create-project

5.  Prompts for the project name, creates a folder, sets up our claude
    > commands in a .claude folder, creates the unity project, and
    > installs the MCP server.

6.  From here on out, they just use claude code ~~or codex~~ directly,
    > however, our claude files tell claude~~/codex~~ that the
    > game-agent command exists and can be used for other operations in
    > the future.

    a.  Kind of like an MCP server, but without MCP.

    b.  For launch it has no commands, but later on if we want to
        > provide a faster way to do things than using MCP (maybe
        > creating materials, getting a list of places that have assets,
        > etc), it can use our command to do it.

    c.  We really want to turn this command into a must-have for any
        > unity project that's being developed.

### Friday Delivery Checklist 

**Tuesday (Teis):**

-   Finish Minecraft demo

-   Finish Golf demo

-   Show demos to Max

**Wednesday (Max):**

-   Draft blog post outline

-   Define key points and narrative

-   Identify needed assets (screenshots, GIFs)

-   Determine where to publish

-   Define call to action

**Wednesday/Thursday (Teis):**

-   Design CLI architecture (decide: nodejs/bun/rust)

-   Build one-liner install command

-   Build create-project command (prompts for name, creates folder)

-   Build Unity project creation command

-   Build Claude commands install command

-   Test CLI on Mac

-   Test CLI on Windows (?stretch goal)

**Thursday (Max + Team):**

-   Finalize blog post assets (screenshots, GIFs from demos)

-   Create public GitHub repo

-   Decide: \@NormalVR or \@game-agent org?

-   Upload Claude commands to repo

-   Write README with installation instructions

**Friday (Max):**

-   Write Show HN post

-   Consult \"how to hit front page\" guide

-   Decide: Show HN vs. regular post

-   Publish blog post

-   Post to Hacker News

-   Monitor comments and measure response
