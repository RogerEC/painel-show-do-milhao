(function($) {
    $.fn.invisible = function() {
        return this.each(function() {
            $(this).css("visibility", "hidden");
        });
    };
    $.fn.visible = function() {
        return this.each(function() {
            $(this).css("visibility", "visible");
        });
    };
}(jQuery));

function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$(function() {
    
    const socket = io(window.location.href);

    let deletedAlternative = [false, false, false, false, false];
    let numberQuestion = 0;
    let counterAlternative = 0;
    let flagUseCard = false;

    $("#btn-show-control-panel").on('click', function(){
        $("title").text("Show do Milhão - Painel de Controle");
        $("#home-panel").hide();
        $("#control-panel").show();
        $("#display-panel").hide();
    });

    $("#btn-show-display-panel").on('click', function(){
        $("title").text("Show do Milhão - Painel de Exibição")
        $("#home-panel").hide();
        $("#control-panel").hide();
        $("#display-panel").show();
    });

    $("#btn-switch-video-slide").on('click', function(){
        socket.emit('switch-video-slide');
    });

    $("#btn-show-next-question").on('click', function(){
        $(this).attr('disabled', true);
        $("#btn-show-next-alternative").attr('disabled', false);
        counterAlternative = 97;
        socket.emit('show-next-question');
    });

    $("#btn-show-next-alternative").on('click', function(){
        if(counterAlternative < 102){
            counterAlternative++;
            if(counterAlternative === 102){
                $(this).attr('disabled', true);
                $("#btn-delete-alternative").attr('disabled', false);
                $("#btn-draw-card").attr('disabled', false);
                $("#btn-clear-selected-alternatives").attr('disabled', false);
                $(".btn-select-alternative").each(function(){
                    $(this).attr('disabled', false);
                });
                $('.btn-disable-alternative').each(function(){
                    $(this).attr('disabled', false);
                });
                $('#btn-clear-disabled-alternatives').attr('disabled', false);
            }
            socket.emit('show-next-alternative', (counterAlternative-1));
        }
    });

    $("#btn-clean-screen").on('click', function(){
        for(var i=0; i<5; i++){
            deletedAlternative[i]=false;
        }
        flagUseCard = false;
        $(this).attr('disabled', true);
        $('#btn-switch-video-slide').attr('disabled', true);
        $("#btn-show-next-question").attr('disabled', false);
        $('#img-card').hide();
        $(".result-slide-question").each(function(){
            $(this).hide();
        });
        $('#video').show();
        socket.emit('clean-screen');
    });

    $(".btn-select-alternative").on('click', function(){
        if(deletedAlternative[($(this).val().charCodeAt()-97)]) return;
        $("#btn-delete-alternative").attr('disabled', true);
        $("#btn-draw-card").attr('disabled', true);
        $("#btn-check-question").attr('disabled', false);
        socket.emit('select-alternative', $(this).val());
    });

    $("#btn-clear-selected-alternatives").on('click', function(){
        if(!flagUseCard){
            $("#btn-draw-card").attr('disabled', false);
        }
        $("#btn-delete-alternative").attr('disabled', false);
        $("#btn-check-question").attr('disabled', true);
        socket.emit('clear-selected-alternatives');
    });

    $(".btn-disable-alternative").on('click', function(){
        socket.emit('disable-alternative', $(this).val());
    });

    $("#btn-clear-disabled-alternatives").on('click', function(){
        socket.emit('clear-disabled-alternatives');
    });

    $("#btn-draw-card").on('click', function(){
        $(this).attr('disabled', true);
        flagUseCard = true;
        socket.emit('draw-card');
    });

    $("#btn-check-question").on('click', function(){
        $('button').each(function(){
            $(this).attr('disabled', true);
        });
        $('#btn-switch-video-slide').attr('disabled', false);
        $('#btn-clean-screen').attr('disabled', false);
        socket.emit('check-question');
    });

    $("#btn-delete-alternative").on('click', function(){
        $("#btn-draw-card").attr('disabled', true);
        if(counterAlternative > 99){
            socket.emit('delete-alternative', counterAlternative);
            counterAlternative--;
        }
    });

    $("#btn-reset-alternative").on('click', function(){
        socket.emit('reset-alternative');
    });

    socket.on('show-next-question', function(){
        const audio = new Audio("/assets/audio/sound-new-question.mp3"); //sound-new-question
        audio.play();
        $("#text-question").text(question[numberQuestion].questionText);
        $("#text-alternative-a").text(question[numberQuestion].textA);
        $("#text-alternative-b").text(question[numberQuestion].textB);
        $("#text-alternative-c").text(question[numberQuestion].textC);
        $("#text-alternative-d").text(question[numberQuestion].textD);
        $("#text-alternative-e").text(question[numberQuestion].textE);
        $("#question").show();
    });

    socket.on('show-next-alternative', function(code){
        $("#alternative-"+String.fromCharCode(code)).show();
    });

    socket.on('clean-screen', function(){
        flagUseCard = false;
        $("#question").hide();
        $("#alternative-a").hide();
        $("#alternative-b").hide();
        $("#alternative-c").hide();
        $("#alternative-d").hide();
        $("#alternative-e").hide();
        $(".alternative").removeClass('alternative-deleted')
        $(".alternative").removeClass('alternative-selected');
        $(".alternative").removeClass('alternative-correct');
        $(".alternative").removeClass('alternative-wrong');
        $(".alternative").visible();
        numberQuestion++;
    });

    socket.on('select-alternative', function(alternative){
        $(".alternative").removeClass('alternative-selected');
        $("#alternative-"+alternative).removeClass('alternative-deleted');
        $("#alternative-"+alternative).addClass('alternative-selected');
        $("#selected-alternative").val(alternative);
    });

    socket.on('disable-alternative', function(alternative){
        $(".alternative").removeClass('alternative-selected');
        $("#alternative-"+alternative).addClass('alternative-deleted');
    });

    socket.on('clear-selected-alternatives', function(){
        if(flagUseCard){
            $("#video").show();
            $("#img-card").hide();
        }
        $(".alternative").removeClass('alternative-selected');
    });

    socket.on('draw-card', function(){
        flagUseCard = true;
        let number = random(0, 3);
        $(".result-slide-question").each(function(){
            $(this).hide();
        });
        $("#video").hide();
        $("#img-card").attr('src', '/assets/img/'+number+'.png').show();
    });

    socket.on('switch-video-slide', function(){
        if($("#video").is(':hidden') === true){
            $(".result-slide-question").each(function(){
                $(this).hide();
            });
            $("#video").show();
        }else{
            $("#video").hide();
            $(".result-slide-question").each(function(){
                $(this).hide();
            });
            $("#result-slide-question-"+numberQuestion).show();
        }
    });

    socket.on('check-question', function(){
        if($("#selected-alternative").val() === question[numberQuestion].correctAnswer.toLowerCase()){
            const audio = new Audio("/assets/audio/sound-correct-answer.mp3"); //sound-new-question
            audio.play();
            $("#alternative-"+question[numberQuestion].correctAnswer.toLowerCase()).removeClass('alternative-deleted').addClass('alternative-correct');
        }else{
            const audio = new Audio("/assets/audio/sound-wrong-answer.mp3"); //sound-new-question
            audio.play();
            $("#alternative-"+$("#selected-alternative").val()).addClass('alternative-wrong');
            $("#alternative-"+question[numberQuestion].correctAnswer.toLowerCase()).removeClass('alternative-deleted').addClass('alternative-correct');
        }
    });

    socket.on('delete-alternative', function(code){
        $(".result-slide-question").each(function(){
            $(this).hide();
        });
        $("#img-card").hide();
        $("#video").show();

        let number = 0;

        while(code >= 99){
            
            number = random(97, 101);
            
            if(String.fromCharCode(number) === question[numberQuestion].correctAnswer.toLowerCase()){
                continue;
            }
            
            if($("#alternative-"+String.fromCharCode(number)).css("visibility") === "hidden"){
                continue;
            }
            
            $("#alternative-"+String.fromCharCode(number)).invisible();

            socket.emit('deleted-alternative', (number-97));

            break;
        }
    });

    socket.on('deleted-alternative', function(index){
        deletedAlternative[index] = true;
    });

    socket.on('clear-disabled-alternatives', function(){
        $('.alternative').removeClass('alternative-deleted');
    });

    // uso da câmera Virtual OBS 
    navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: '05e0c373605f319fa1d940e97fd16e509966b3ac4042ef080763f9585c281f70' } } })
    .then(function (mediaStream) {
        var video = document.querySelector('#video');
        video.srcObject = mediaStream;
        video.play();
    }).catch(function (err) {
    console.log(err);
    console.log('Não há permissões para acessar a webcam');
    });
});