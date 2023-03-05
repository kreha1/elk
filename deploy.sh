# This is a simple script to update my Elk instance, you can ignore it

rm elk.tar

docker build . -t elk
docker image save elk -o elk.tar

echo 'Copying Docker image...'
scp elk.tar basil@litterbox:/home/basil/docker/build/elk.tar

echo 'Stopping, loading and starting...'
ssh basil@litterbox 'cd /home/basil/docker && sudo docker compose stop elk && sudo docker image load -i /home/basil/docker/build/elk.tar && rm /home/basil/docker/build/elk.tar && cd /home/basil/docker && sudo docker compose up -d'

# Cleanup
rm elk.tar