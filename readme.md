playground

Здесь я решил реализовать одну интерсную для меня задумку и потренироваться в написании Javascript. В итоге у меня получился прототип (как мне кажется даже рабочий :) ), который позволяет просматривать видео с различных видеохостингов (пока только youtube, а в планах vimeo...) нескольким пользователям с синхронизацией видеопотока. То есть если пользователь А и Б открыли видео в своих браузерах, то таймлайн у видео будет одинаков, если кто то из них нажмет на паузу или плай, то плеер у всех пользователей перейдет в соответсвующее состояние. А еще есть реалтайм чат :)

Возможно я не очень понятно это изложил, так что просто попробуйте:
<ul>
<li>1. Откройте любое видео на youtube и скопируйте его урл из адресной строки</li>
<li>2. Вставьте URL из п.1 в поле Put URL</li>
<li>3. Скопируйте URL из строки Get URL и отправьте его всем людям с которыми вы хотите посмотреть данное видео.</li>
<li>4. Теперь когда все пользователи подключились, вы можете общаться в чате, ставить на паузу/плай или перематывать свое видео, и видео плеер у других пользователей также будет переходить в соответствующее состояние.</li>
</ul>
(Можете потестить и на своем компьютере, просто откройте страницу по сгенерированному URL в соседней вкладке)
