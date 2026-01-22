# Clean slate - remove all gamekit traces                             
  rm -f ~/Downloads/gamekit-darwin-arm64                                
  rm -rf ~/.gamekit                                                     
                                                                        
  Or as a one-liner:                                                    
                                                                        
  rm -f ~/Downloads/gamekit-darwin-arm64 && rm -rf ~/.gamekit && echo   
  "Clean slate!"                                                        
                                                                        
  This removes:                                                         
  - ~/Downloads/gamekit-darwin-arm64 - downloaded binary                
  - ~/.gamekit/bin/gamekit - installed binary                           
  - ~/.gamekit/template - cached template                               
  - ~/.gamekit/update.log - update logs                                 
  - ~/.gamekit/last-update-check - update timestamp 
