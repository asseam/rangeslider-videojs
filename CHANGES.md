### Breaking Changes ###
### @TODO tell people what this is
player.lockSlider => player.rangeslider.lock();
player.unlockSlider => player.rangeslider.unlock();
player.showSlider => player.rangeslider.show();
player.hideSlider => player.rangeslider.hide();
player.showSliderPanel => player.rangeslider.showPanel();
player.hideSliderPanel => player.rangeslider.hidePanel();
player.showControlTime => player.rangeslider.showControlTime();
player.hideControlTime => player.rangeslider.hideControlTime();
player.setValueSlider => player.rangeslider.setValues();
player.getValueSlider => player.rangeslider.getValues();
player.playBetween => player.rangeslider.playBetween();
player.loopBetween => player.rangeslider.loop();

     
### internal method renaming
showcontrolTime => showControlTime
hidecontrolTime => hideControlTime