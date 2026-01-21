# Setup gamekit from Downloads 
mkdir -p ~/.gamekit/bin && \                                                     
mv ~/Downloads/gamekit-darwin-arm64 ~/.gamekit/bin/gamekit && \                  
chmod +x ~/.gamekit/bin/gamekit && \                                             
xattr -d com.apple.quarantine ~/.gamekit/bin/gamekit && \                        
export PATH="$PATH:$HOME/.gamekit/bin" && \                                      
gamekit --version                                                                
                       